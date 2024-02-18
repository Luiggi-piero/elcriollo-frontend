import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router){}

  /**
   * canActivate: Este método es requerido para implementar la interfaz CanActivate y 
   * se llama cuando se intenta acceder a una ruta. Toma como argumentos un ActivatedRouteSnapshot 
   * y un RouterStateSnapshot, que representan la ruta que se está intentando activar y el estado 
   * actual del enrutador, respectivamente. 
   * 
   * NOTA: si las rutas son dimanicas tanto  route y state brindaran diferentes rutas, pero si son estáticas
   * las rutas de route.url.join('/') y state.url serán iguales como el caso para checkout
   * 
   * ejemplo ruta dinamica
   * es dinamica por el parametro dinamico id y el componente que se carga puede cambiar de acuerdo al id
   * { path: 'products/:id', component: ProductDetailComponent }
   * 
   * ejemplo ruta estatica
   * { path: 'checkout', component: CheckoutPageComponent, canActivate: [AuthGuard] } => sin parametro
   */

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if(this.userService.currentUser.token) return true;

    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
    return false;
  }
  
}
