import { Component, inject, OnDestroy } from '@angular/core';
import { DetalleUsuarioComponent } from '../detalle-usuario/detalle-usuario.component';
import { ListadoUsuariosComponent } from '../listado-usuarios/listado-usuarios.component';
import { DatabaseService } from '../services/database.service';
import { RegisterComponent } from '../register/register.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ListadoHistorialComponent } from '../listado-historial/listado-historial.component';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [DetalleUsuarioComponent, ListadoUsuariosComponent, RegisterComponent, ListadoHistorialComponent, FormsModule],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.scss'
})
export class SeccionUsuariosComponent implements OnDestroy {
  database = inject(DatabaseService);
  usuarios : any[] = [];
  turnos : any[] = [];
  detalleUsuario! : any;
  admins : any[] = [];
  especialistas : any[] = [];
  pacientes : any[] = [];
  registrar : boolean = false;
  usuarioRegistrar : string = "";
  canceladoRecibido : boolean = false;
  flagAnim : boolean = true;

  mostrar : string = "turnos";

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

    this.database.traerUsuarios('turnos').subscribe((turnos:any)=>{
      setTimeout(() => {
        this.turnos = [];
        this.turnos = turnos;
      }, 1000);
    })
  }

  recibirDetalleUsuario(usuario : any){
    this.detalleUsuario = usuario;
  }

  recibirFlag(flag : any){
    this.flagAnim = !flag
    setTimeout(async () => {
      this.registrar = !flag;
    }, 500);
    console.log(flag)
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
