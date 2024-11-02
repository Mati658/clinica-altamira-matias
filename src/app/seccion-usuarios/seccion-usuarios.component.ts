import { Component, inject, OnDestroy } from '@angular/core';
import { DetalleUsuarioComponent } from '../detalle-usuario/detalle-usuario.component';
import { ListadoUsuariosComponent } from '../listado-usuarios/listado-usuarios.component';
import { DatabaseService } from '../services/database.service';
import { RegisterComponent } from '../register/register.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [DetalleUsuarioComponent, ListadoUsuariosComponent, RegisterComponent],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.scss'
})
export class SeccionUsuariosComponent implements OnDestroy {
  database = inject(DatabaseService);
  usuarios : any[] = [];
  detalleUsuario! : any;
  admins : any[] = [];
  especialistas : any[] = [];
  pacientes : any[] = [];
  registrar : boolean = false;
  usuarioRegistrar : string = "";
  canceladoRecibido : boolean = false;

  pacientesBD! : Subscription;
  especialistasBD! : Subscription;
  adminsBD! : Subscription;

  constructor(){
    this.adminsBD = this.database.traerUsuarios('administradores').subscribe((usuario:any)=>{
        this.admins = usuario;
        this.actualizarUsuarios();
    })
    this.especialistasBD =this.database.traerUsuarios('especialistas').subscribe((usuario:any)=>{
        this.especialistas = usuario;
        this.actualizarUsuarios();
    })
    this.pacientesBD =this.database.traerUsuarios('pacientes').subscribe((usuario:any)=>{
        this.pacientes = usuario;
        this.actualizarUsuarios();
    })
  }

  recibirDetalleUsuario(usuario : any){
    this.detalleUsuario = usuario;
  }

  actualizarUsuarios(){
    this.usuarios = []
    this.usuarios = this.usuarios.concat(this.admins,this.especialistas,this.pacientes);
    console.log(this.usuarios)
  }

  ngOnDestroy(): void {
    this.pacientesBD.unsubscribe();
    this.especialistasBD.unsubscribe();
    this.adminsBD.unsubscribe();
  }
}
