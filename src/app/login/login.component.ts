import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Paciente } from '../../classes/paciente';
import { Especialista } from '../../classes/especialista';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormsModule, LoaderComponent],
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
        this.router.navigateByUrl("");
      }
      this.flagLoader = false;
    });
  }
}
