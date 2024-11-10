import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { Paciente } from '../../classes/paciente';
import { Especialista } from '../../classes/especialista';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { LoaderComponent } from '../loader/loader.component';
import { Administrador } from '../../classes/administrador';
import { RecaptchaComponent, RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormsModule, LoaderComponent, RecaptchaFormsModule, RecaptchaModule,RecaptchaFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  protected auth = inject(AuthService);
  private database = inject(DatabaseService);
  @Output() canelado : EventEmitter<boolean> = new EventEmitter<boolean>;

  fb = inject(FormBuilder);
  formGroup : FormGroup;
  usuario : string = "";
  especializacion : string = "";
  obraSocial : string = "";
  especialistaFlag : boolean = false;
  flagLoader : boolean = false;
  flagUsuarioElegido : boolean = false;
  imagen1URL : string = "";
  imagen2URL : string = "";
  imagen1 : any;
  imagen2 : any;
  especializaciones :any[] = [];
  mensaje : string = "Verifique su mail";
  especializacionesSeleccionadas : string[] = [];
  captcha : string = "";

  constructor(){
    this.formGroup = this.fb.group({
      nombre: ["", [Validators.required, Validators.minLength(2)]],
      apellido : ["",[Validators.required, Validators.minLength(2)]],
      edad : ["",[Validators.required, Validators.pattern('[0-9]*'), Validators.min(2)]],
      dni : ["",[Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern('[0-9]*')]],
      mail : ["",[Validators.required]],
      clave : ["",[Validators.required, Validators.minLength(6)]],
      obraSocial: [""],
      imagen1 : ["",[Validators.required]],
      imagen2 : ["",[Validators.required]],
      especialista: [""]
    });

    this.database.traerEspecializaciones().subscribe(res=>{
      this.especializaciones = res;
    })
  }

  limpiar(){
    this.formGroup.controls["nombre"].setValue("");
    this.formGroup.controls["apellido"].setValue("");
    this.formGroup.controls["edad"].setValue("");
    this.formGroup.controls["dni"].setValue("");
    this.formGroup.controls["mail"].setValue("");
    this.formGroup.controls["clave"].setValue("");
    this.formGroup.controls["obraSocial"].setValue("");
    this.formGroup.controls["especialista"].setValue("");
  }

  registrar(){
    if (this.formGroup.invalid) {
      console.log(this.formGroup.errors)

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Llene TODOS los campos!!!"
      });
      return 
    }
    this.mensaje = "Verifique su mail";
    let imagenes : any[]= [this.imagen1, this.imagen2];
    let subirUsuario : Paciente | Especialista | Administrador;

    switch (this.usuario) {
      case 'paciente':
        if (this.formGroup.controls["obraSocial"].value == "" || this.formGroup.controls["obraSocial"].value == 0) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Llene TODOS los campos!!!"
          });
          return 
        }
        this.flagLoader = true;
        subirUsuario = new Paciente(this.formGroup.controls["nombre"].value, this.formGroup.controls["apellido"].value, this.formGroup.controls["edad"].value, this.formGroup.controls["dni"].value, this.formGroup.controls["obraSocial"].value, this.formGroup.controls["mail"].value);
        console.log(subirUsuario);
        break;
    
      case 'especialista':
        this.flagLoader = true;
        if (this.formGroup.controls["especialista"].value != "") { 
          this.especializacionesSeleccionadas.push(this.formGroup.controls["especialista"].value)
          if (!this.especializaciones.includes(this.formGroup.controls["especialista"].value)) {
            console.log('especializacion: '+ this.formGroup.controls["especialista"].value)
            this.database.agregarEspecializacion(this.formGroup.controls["especialista"].value);
          }
        }
        if (this.especializacionesSeleccionadas.length == 0) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Llene TODOS los campos!!!"
          });
          this.flagLoader = false;
          return 
        }
        subirUsuario = new Especialista(this.formGroup.controls["nombre"].value, this.formGroup.controls["apellido"].value, this.formGroup.controls["edad"].value, this.formGroup.controls["dni"].value, this.especializacionesSeleccionadas, this.formGroup.controls["mail"].value);
        console.log(subirUsuario);
        
        break;

      case 'administrador':
        this.flagLoader = true;
        subirUsuario = new Administrador(this.formGroup.controls["nombre"].value, this.formGroup.controls["apellido"].value, this.formGroup.controls["edad"].value, this.formGroup.controls["dni"].value, this.formGroup.controls["mail"].value);
        console.log(subirUsuario);
        break;
    }

    if (this.auth.perfil == "Administrador") {
      this.auth.registroAdmin(this.formGroup.controls['mail'].value, this.formGroup.controls['clave'].value).then(res=>{
        if (res) {
          this.database.agregarUsuario(subirUsuario,imagenes, this.usuario);
          this.flagLoader = false;
        }
      }).catch(err =>{
        this.flagLoader = false;
        console.log(err);
      })
    }else{

      this.auth.registro(this.formGroup.controls['mail'].value, this.formGroup.controls['clave'].value).then(res=>{
        if (res) {
          this.database.agregarUsuario(subirUsuario,imagenes, this.usuario);
          this.auth.enviarMail();
        }else{
          this.flagLoader = false;
        }
      }).catch(err =>{
        this.flagLoader = false;
        console.log(err);
      })
    }
    
  }

  obtenerImagen($event : any, imagen_seleccion:number){
    //---Para SUBIR la imagen---
    let file : any = $event.target.files[0];
    const imagen = new Blob([file],{
      type:file.type
    });

    if (imagen_seleccion == 1) {
      this.imagen1 = imagen;
      
    }else{
      this.imagen2 = imagen;
    }

    //---Para MOSTRAR la imagen---
    const fileURL = $event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (imagen_seleccion == 1) {
        this.imagen1URL = reader.result as string;
      }else{
        this.imagen2URL = reader.result as string;
      }
    };

    reader.readAsDataURL(fileURL);
  }

  recibirEspecializacion(event : Event){
    this.especialistaFlag = false;
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value != "0") {
      this.especializacion = selectElement.value;
      if (selectElement.value == "Otro") {
        this.especialistaFlag = true;
        this.formGroup.controls["especialista"].setValue("");
      }
    }
  }

  recibirObraSocial(event : Event){
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value != "0") {
      this.obraSocial = selectElement.value;
      console.log(this.formGroup.controls["obraSocial"].value);
    }
  }


  onEspecializacionChange($event:any){
    if ($event.target.value =="otro") {
      if (!$event.target.checked){
        this.especialistaFlag = false;
        return;
      }
      this.especialistaFlag = true;
      this.formGroup.controls["especialista"].setValue("");
    }else{
      if ($event.target.checked) {
        this.especializacionesSeleccionadas.push($event.target.value)
      }else{
        let indice = this.especializacionesSeleccionadas.indexOf($event.target.value);
        this.especializacionesSeleccionadas.splice(indice, 1);
      }
    }

    console.log(this.especializacionesSeleccionadas);
  }

  obtenerCaptcha(event : any){
    setTimeout(() => {
      this.captcha = event;
    }, 1000);
  }
}
