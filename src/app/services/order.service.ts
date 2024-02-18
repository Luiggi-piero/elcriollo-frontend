import { Injectable } from '@angular/core';
import { Order } from '../shared/models/Order';
import { HttpClient } from '@angular/common/http';
import { ORDER_CREATE_URL, ORDER_NEW_FOR_CURRENT_USER_URL, ORDER_PAY_URL, ORDER_TRACK_URL } from '../shared/constants/urls';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }

  create(order: Order) {
    // Se usa el interceptor para agregar el access_token
    return this.http.post<Order>(ORDER_CREATE_URL, order);
  }

  // Obtener el nuevo pedido del usuario actual (ya fue creado previamente)
  getNewOrderForCurrentUser(): Observable<Order> {
    return this.http.get<Order>(ORDER_NEW_FOR_CURRENT_USER_URL);
  }

  // Pagar con paypal
  pay(order: Order): Observable<string> {
    return this.http.post<string>(ORDER_PAY_URL, order);
  }

  // Obtener/rastrear pedido por id
  trackOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(ORDER_TRACK_URL + 'id');
  }
}
