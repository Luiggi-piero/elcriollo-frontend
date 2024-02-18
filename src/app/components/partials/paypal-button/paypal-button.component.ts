import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/shared/models/Order';

// window.paypal
declare var paypal: any;

@Component({
  selector: 'paypal-button',
  templateUrl: './paypal-button.component.html',
  styleUrls: ['./paypal-button.component.css']
})
export class PaypalButtonComponent implements OnInit {
  @Input()
  order!: Order;

  @ViewChild('paypal', { static: true })
  paypalElement!: ElementRef;

  constructor(private toastrService: ToastrService,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router) { }

  ngOnInit(): void {
    // capturar el contexto, usado con funciones de devolucion de llamada
    // Almacenar this en self asegura que el contexto sea el mismo dentro de esas funciones
    // permitiendo que se acceda a las propiedades y métodos del componente Angular sin ambigüedades.
    // Entonces, cuando se ve self dentro de las funciones de devolución de llamada, 
    // se está refiriendo al componente Angular en sí mismo.
    const self = this;
    
    /**
     * Crea y devuelve un objeto de botones, que se mostrara en el html
     * este objeto tiene 3 funciones de devolución
     */
    paypal
      .Buttons({
        /**
         * createOrder: se ejecuta para la creacion de un pedido
         * se define la estructura del pedido que se enviará a paypal
         * en agrega la unidad de la moneda (en este caso CAD -> dólares canadienses)
         * y el valor (value -> precio total del pedido)
         */
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: 'CAD',
                  value: self.order.totalPrice,
                },
              },
            ],
          });
        },

        /**
         * onApprove: se ejecuta cuando el pago es aprobado por el usuario
         */
        onApprove: async (data: any, actions: any) => {
          // captura el pago
          const payment = await actions.order.capture();
          this.order.paymentId = payment.id;
          self.orderService.pay(this.order).subscribe(
            {
              next: (orderId) => {
                this.cartService.clearCart();
                this.router.navigateByUrl('/track/' + orderId);
                this.toastrService.success(
                  'Pago guardado con éxito',
                  'Excelente'
                );
              },
              error: (error) => {
                this.toastrService.error('Error al guardar el pago', 'Error');
              }
            }
          );
        },

        /**
         * onError: se ejecuta cuando ocurre un error durante el proceso de pago
         */
        onError: (err: any) => {
          this.toastrService.error('Pago fallido', 'Error');
          console.log(err);
        },
      })
      .render(this.paypalElement.nativeElement); // renderiza los botones en paypalElement
  }
}
