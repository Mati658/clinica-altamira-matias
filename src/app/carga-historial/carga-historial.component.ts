import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-carga-historial',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './carga-historial.component.html',
  styleUrl: './carga-historial.component.scss'
})
export class CargaHistorialComponent {
  fb = inject(FormBuilder);
  formGroup : FormGroup;
  flagValor1 : boolean = false;
  flagValor2 : boolean = false;
  flagValor3 : boolean = false;
  historial : any = {
    'altura': 0, 'peso' : 0, 'temperatura' : 0, 'presion': 0, 
    'clave1': "", 'clave2': "", 'clave3': "",
    'valor1': "", 'valor2': "", 'valor3': ""
  }

  @Output() historialCompleto : EventEmitter<any> = new EventEmitter<any>;
  @Output() cancelado : EventEmitter<boolean> = new EventEmitter<boolean>;


  constructor(){
    this.formGroup = this.fb.group({
      altura : ["",[Validators.required]],
      peso : ["",[Validators.required]],
      temperatura : ["",[Validators.required]],
      presion : ["",[Validators.required]],
    });
  }

  cargarHistoria(){
    if (this.formGroup.invalid) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "info",
        title: "Valide bien los campos!!"
      });
      return
    }

    this.historial.altura = this.formGroup.controls['altura'].value;
    this.historial.peso = this.formGroup.controls['peso'].value;
    this.historial.temperatura = this.formGroup.controls['temperatura'].value;
    this.historial.presion = this.formGroup.controls['presion'].value;


    if (this.formGroup.controls['clave1']) {      
      this.historial.clave1 = this.formGroup.controls['clave1'].value;
      this.historial.valor1 = this.formGroup.controls['valor1'].value;
    }

    if (this.formGroup.controls['clave2']) { 
      this.historial.clave2 = this.formGroup.controls['clave2'].value;
      this.historial.valor2 = this.formGroup.controls['valor2'].value;
    }
    
    if (this.formGroup.controls['clave3']) {
      this.historial.clave3 = this.formGroup.controls['clave3'].value;
      this.historial.valor3 = this.formGroup.controls['valor3'].value;
    }     
    
    this.historialCompleto.emit(this.historial);
    console.log(this.historial)
  }

  agregarControl(campo: string, required: boolean): void {
    const validators = required ? [Validators.required] : [];
    this.formGroup.addControl(campo, this.fb.control('', validators));
  }
}
