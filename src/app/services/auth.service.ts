import { inject, Injectable } from '@angular/core';
import { Auth, NextOrObserver, Unsubscribe } from '@angular/fire/auth';
import { DatabaseService } from './database.service';
import { Router } from '@angular/router';
import { Paciente } from '../../classes/paciente';
import { Especialista } from '../../classes/especialista';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, updateCurrentUser, User } from '@firebase/auth';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  database = inject(DatabaseService);
  auth = inject(Auth);
  router = inject(Router);
  
  authSubscription?: Unsubscribe;
  usuario : Paciente | Especialista |any = null;
  
  nombre : string = "";
  perfil : string = "";
  mailVerificado : string = "";
  especialistaAprobado : string = "";
  mail : string | null = "";
  logeado : boolean = false;
  usuarioActual : any = null;
  constructor() {
    this.authSubscription = this.onAuthStateChanged((auth) => {
      if(auth?.email){
        this.logeado = true;
        this.usuario = auth;
      }else{
        this.usuario = null;
        this.logeado = false;
        this.nombre = "";
        this.mail = ""; 
        this.perfil = "";
        this.mailVerificado = "";
      }
    });
   }

  async login(email:string, password:string){
    let bool : boolean = false;
    await signInWithEmailAndPassword(this.auth, email, password).then(res =>{
      if (this.auth.currentUser?.emailVerified) {
        bool = true
        this.mail = this.auth.currentUser.email;
      } else {
        bool = true
        if (this.auth.currentUser) {
          sendEmailVerification(this.auth.currentUser)
        }
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
          title: "Mail no verificado!!"
        });
      }
    }).catch(err =>{
      let mensaje : string = "";
      mensaje = password == "" ? "Verifique su contraseña " : "";
      mensaje += email.includes("@") == false ? "Verifique su mail"  : "";
      mensaje += mensaje == "" ? "Ocurrió un error. Por favor, intente nuevamente." : "";

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: mensaje,
      });
      bool = false;
    });
    return bool;
  }
  
  async registro(email:string, password:string) :  Promise<boolean>{
    let bool : boolean = false;
    await createUserWithEmailAndPassword(this.auth, email, password).then(res =>{
      // console.log(res);
      bool = true;
    }).catch(err =>{
      let mensaje : string = "";
      mensaje += err.code === 'auth/email-already-in-use' ? "Este mail ya está registrado" : "";
      mensaje += email.includes("@") == false ? "Verifique su mail"  : "";
      mensaje += mensaje == "" ? "Ocurrió un error. Por favor, intente nuevamente." : "";

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: mensaje,
      });
      bool = false;
    });
    return bool;
  }

  async registroAdmin(email:string, password:string) :  Promise<boolean>{
    let bool : boolean = false;
    this.usuarioActual = this.auth.currentUser;
    await createUserWithEmailAndPassword(this.auth, email, password).then(res =>{
      bool = true;
      this.enviarMail();
      if (this.usuarioActual) {
        updateCurrentUser(this.auth, this.usuarioActual);
      }
    }).catch(err =>{
      let mensaje : string = "";
      mensaje += err.code === 'auth/email-already-in-use' ? "Este mail ya está registrado" : "";
      mensaje += email.includes("@") == false ? "Verifique su mail"  : "";
      mensaje += mensaje == "" ? "Ocurrió un error. Por favor, intente nuevamente." : "";

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: mensaje,
      });
      bool = false;
    });
    
    return bool;
  }

  signOut(){
    this.usuarioActual = null
    this.logeado = false;
    this.perfil = "";
    this.router.navigateByUrl("")
    return this.auth.signOut()
  }

  onAuthStateChanged(auth : NextOrObserver<User | null>){
    return this.auth.onAuthStateChanged(auth);
  }

  enviarMail(){
    if (this.auth.currentUser) {
      sendEmailVerification(this.auth.currentUser).then(()=>{
        let intervalId = setInterval(() => {   
          this.auth.currentUser?.reload().then(() => {
            if (this.auth.currentUser?.emailVerified) {
              clearInterval(intervalId);
              if (this.usuarioActual == null) {
                this.router.navigateByUrl("");
              }
            }
          });
        }, 500);
      })
    }
  }
}
