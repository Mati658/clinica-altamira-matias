import { Component, inject, OnDestroy } from '@angular/core';
import { DetalleUsuarioComponent } from '../detalle-usuario/detalle-usuario.component';
import { ListadoUsuariosComponent } from '../listado-usuarios/listado-usuarios.component';
import { DatabaseService } from '../services/database.service';
import { RegisterComponent } from '../register/register.component';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ListadoHistorialComponent } from '../listado-historial/listado-historial.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [DetalleUsuarioComponent, ListadoUsuariosComponent, RegisterComponent, ListadoHistorialComponent, FormsModule, ClickOutsideDirective],
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
    this.flagAnim = true;
    }, 500);
    console.log(flag)
  }

  actualizarUsuarios(){
    this.usuarios = []
    this.usuarios = this.usuarios.concat(this.admins,this.especialistas,this.pacientes);
    console.log(this.usuarios)
  }

  descargarExcel() {
    // 1. Define los datos en formato JSON
    let datos : any = [];

    this.usuarios.forEach(async user=>{
      let data : any = {
        Nombre:`${user.nombre} ${user.apellido}`,
        Apellido:user.apellido,
        Edad:user.edad,
        DNI:user.dni,
        Mail:user.mail,
        Tipo:user.tipoUsuario
      };

      if (user.tipoUsuario == "especialista") {
        let especialidades : string[] = [];
        user.especializaciones.forEach(async (especialidad:string) => {
          especialidades.push(especialidad);
        });
        let formateado = especialidades.join(', ')
        data.Especializaciones = formateado;
      }
      datos.push(data);
    })


      const worksheet = XLSX.utils.json_to_sheet(datos);

       // Ajustar el ancho de las columnas
      worksheet['!cols'] = [
        { wch: 25 }, // Ancho de la columna "Nombre"
        { wch: 25 }, // Ancho de la columna "Apellido"
        { wch: 25 }, // Ancho de la columna "Edad"
        { wch: 10 }, // Ancho de la columna "DNI"
        { wch: 40 }, // Ancho de la columna "Mail"
        { wch: 15 }, // Ancho de la columna "Mail"
        { wch: 100 }, // Ancho de la columna "Especialidad"
      ];


      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `Datos-Usuarios.xlsx`);
  }

  ngOnDestroy(): void {
    this.pacientesBD.unsubscribe();
    this.especialistasBD.unsubscribe();
    this.adminsBD.unsubscribe();
  }
}
