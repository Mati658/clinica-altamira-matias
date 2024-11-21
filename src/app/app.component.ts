import { Component, inject } from '@angular/core';
import { ChildrenOutletContexts, RouterLink, RouterOutlet } from '@angular/router';
import { DatabaseService } from './services/database.service';
import { AuthService } from './services/auth.service';
import Swal from 'sweetalert2';
import { Especialista } from '../classes/especialista';
import { Subscription } from 'rxjs';
import { LoaderComponent } from './loader/loader.component';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { slideInAnimation } from './animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink,
    LoaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations : [slideInAnimation]
})
export class AppComponent {
  title = 'clinica';

  protected auth = inject(AuthService);
  protected database = inject(DatabaseService);
  pacientes! : Subscription;
  especialistas! : Subscription;
  admins! : Subscription;
  flagLoader : boolean = false;
  mensaje = "Cargando...";
  paginaTurnos : string = "";



  constructor(private contexts: ChildrenOutletContexts){
    registerLocaleData(localeEs, 'es');

    this.auth.onAuthStateChanged((auth) => {
      console.log(this.auth.logeado);
      if (this.auth.logeado && this.auth.usuarioActual == null) {   
        this.flagLoader = true;
        this.especialistas = this.database.traerUsuarios('especialistas').subscribe((users) => {
          let usuarios : any[] = users;
          usuarios.forEach(user => {
            if (user.mail == auth?.email){
              this.paginaTurnos = 'mis-turnos'
              this.auth.id = user.id; 
              this.auth.nombre = user.nombre; 
              this.auth.mail = user.mail; 
              this.auth.perfil = "Especialista";
              this.auth.especialista = user;
              if (this.auth.auth.currentUser?.emailVerified) {
                this.auth.mailVerificado = "✔";
                this.auth.especialistaAprobado = user.aprobado ? "✔" : "❌";
              } else {
                this.auth.mailVerificado  = "❌";
                this.auth.especialistaAprobado = user.aprobado ? "✔" : "❌";
              }
              this.flagLoader = false;
              return;
            }
          });
        });
        this.pacientes = this.database.traerUsuarios('pacientes').subscribe((users) => {
          let usuarios : any[] = users;
          usuarios.forEach(user => {
            if (user.mail == auth?.email){
              this.paginaTurnos = 'mis-turnos'
              console.log(user)
              this.auth.id = user.id; 
              this.auth.nombre = user.nombre; 
              this.auth.mail = user.mail; 
              this.auth.perfil = "Paciente";
              this.auth.paciente = user;
              if (this.auth.auth.currentUser?.emailVerified) {
                this.auth.mailVerificado = "✔";
              } else {
                this.auth.mailVerificado  = "❌";
              }
              this.flagLoader = false;
              return;
            }
          });
        });
        this.admins = this.database.traerUsuarios('administradores').subscribe((users) => {
          let usuarios : any[] = users;
          usuarios.forEach(user => {
            if (user.mail == auth?.email){
              this.paginaTurnos = 'turnos'
              console.log(user)
              this.auth.id = user.id; 
              this.auth.nombre = user.nombre; 
              this.auth.mail = user.mail; 
              this.auth.perfil = "Administrador";
              if (this.auth.auth.currentUser?.emailVerified) {
                this.auth.mailVerificado = "✔";
              } else {
                this.auth.mailVerificado  = "❌";
              }
              this.flagLoader = false;
              return;
            }
          });
        });
      }
    });
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }


  signOut(){
    this.auth.signOut().then(res=>{
      this.pacientes.unsubscribe();
      this.especialistas.unsubscribe();
      this.admins.unsubscribe();
    }).catch(err=>{
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error al salir de la cuenta",
      });
    });
  }
}
