import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { USER_LOGIN_URL, USER_REGISTER_URL } from '../shared/constants/urls';
import { IUserLogin } from '../shared/interfaces/IUserLogin';
import { User } from '../shared/models/User';
import { IUserRegister } from '../shared/interfaces/IUserRegister';

const USER_KEY = "User";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userSubject = new BehaviorSubject<User>(this.getUserFromLocalStorage());
  public userObservable: Observable<User>;

  constructor(private http: HttpClient, private toastrService: ToastrService) {
    this.userObservable = this.userSubject.asObservable();
  }

  public get currentUser(): User {
    return this.userSubject.value;
  }

  login(userLogin: IUserLogin): Observable<User> {
    return this.http.post<User>(USER_LOGIN_URL, userLogin).pipe(
      tap({
        next: (user) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(`Bienvenido a El Criollo ${user.name}`, 'Inicio de sesión exitoso')
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error, 'Ocurrió un error')
        }
      })
    );
  }

  logout() {
    this.userSubject.next(new User());
    localStorage.removeItem(USER_KEY);
    window.location.reload();
  }

  register(userRegister: IUserRegister): Observable<User>{
    return this.http.post<User>(USER_REGISTER_URL, userRegister).pipe(
      tap({
        next: (newUser) => {
          this.setUserToLocalStorage(newUser);
          this.userSubject.next(newUser);
          this.toastrService.success(`Bienvenido/a a El Criollo ${newUser.name}`, 'Registro exitoso');
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error, 'Error en el registro');
        }
      })
    )
  }

  private setUserToLocalStorage(user: User) {
    const userJson = JSON.stringify(user);
    localStorage.setItem(USER_KEY, userJson);
  }

  private getUserFromLocalStorage(): User {
    const userJson = localStorage.getItem(USER_KEY);
    if(userJson) return JSON.parse(userJson) as User;
    return new User();
  }
}
