import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const VALIDATORS_MESSAGES:any = {
  required : "Ingrese un valor",
  email: "Correo inválido",
  minlength: "El campo es muy corto",
  notMatch: "Las contraseñas no coinciden"
}

@Component({
  selector: 'input-validation',
  templateUrl: './input-validation.component.html',
  styleUrls: ['./input-validation.component.css']
})
export class InputValidationComponent implements OnInit, OnChanges {
  
  @Input()
  control!: AbstractControl;
  @Input()
  showErrorsWhen: boolean = true;
  
  errorMessages: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // Escucha los cambios del componente
    this.checkValidation();
  }
  
  ngOnInit(): void {
    // Escucha el cambio en el estado de validacion del control: INVALID o VALID
    this.control.statusChanges.subscribe((ev) => {
      this.checkValidation();
    })

    // Escucha el cambio de valor del control
    this.control.valueChanges.subscribe(() => {
      this.checkValidation();
    })
  }

  checkValidation() {
    const errors = this.control.errors;
    if(!errors) {
      this.errorMessages = [];
      return;
    }
    const errorKeys = Object.keys(errors); // ['required', 'email']
    this.errorMessages = errorKeys.map(key => VALIDATORS_MESSAGES[key]);
  }
}
