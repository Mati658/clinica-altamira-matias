import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Paciente } from '../../classes/paciente';
import { Especialista } from '../../classes/especialista';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { LazyLoadDirective } from '../directives/lazy-load.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormsModule, LoaderComponent, LazyLoadDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  protected auth = inject(AuthService);
  protected database = inject(DatabaseService);
  router = inject(Router);
  fb = inject(FormBuilder);
  formGroup : FormGroup;
  usuario : string = "paciente";
  especializacion : string = "";
  obraSocial : string = "";
  especialistaFlag : boolean = false;
  flagLoader : boolean = false;
  mensaje : string = "Ingresando";
  imagen1URL : string = "";
  imagen2URL : string = "";
  imagen1 : any;
  imagen2 : any;
  especializaciones :any[] = [];

  constructor(){
    this.formGroup = this.fb.group({
      mail : ["",[Validators.required]],
      clave : ["",[Validators.required, Validators.minLength(6)]],
    });
    
  }

  limpiar(){
    this.formGroup.controls["mail"].setValue("");
    this.formGroup.controls["clave"].setValue("");
  }

  login(email:string = "", password:string = ""){
    
    if (email != "" && password != "") {
      this.formGroup.controls['mail'].setValue(email);
      this.formGroup.controls['clave'].setValue(password);
    }
    
    if (this.formGroup.invalid) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Llene TODOS los campos!!!"
      });
      return 
    }
    this.flagLoader = true;


    this.auth.login(this.formGroup.controls['mail'].value, this.formGroup.controls['clave'].value).then((res)=>{
      if (res) {
        this.guardarLogIngreso();
        this.router.navigateByUrl("");
      }
      this.flagLoader = false;
    });
  }

  guardarLogIngreso(){
    const hoy = new Date();
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };

    const fecha = new Date();
    fecha.setDate(hoy.getDate());

    const diaFormateado = (fecha.toLocaleDateString('es-ES', opciones)).split(',').shift();
    

    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    const hora = fecha.getHours();
    const minutos = fecha.getMinutes();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    const horario = `${hora}:${minutos}`;

    console.log(fechaFormateada)
    
    let log : any = {'usuario':`${this.auth.nombre} ${this.auth.apellido}`, 'dia': `${diaFormateado}-${fechaFormateada}`, 'horario': horario};
    console.log(log);
    this.database.agregarColeccion('logIngresos', log);
  }


}
