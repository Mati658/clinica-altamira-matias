import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { LazyLoadDirective } from '../directives/lazy-load.directive';

@Component({
  selector: 'app-listado-usuarios',
  standalone: true,
  imports: [LazyLoadDirective],
  templateUrl: './listado-usuarios.component.html',
  styleUrl: './listado-usuarios.component.scss'
})
export class ListadoUsuariosComponent {
  database = inject(DatabaseService);
  usuarioAnterior : any;

  @Input() usuarios:any[] = [];
  @Input() turnos:any[] = [];
  @Output() detalleUsuario : EventEmitter<any> = new EventEmitter<any>;
  usuario : any;

  seleccionarUsuario(index : number){
    this.marcarUsuario(index);
    this.usuario = this.usuarios[index];
    this.detalleUsuario.emit(this.usuarios[index]);
    console.log(this.usuario)
  }

  onEspecializacionChange($event : any, index : number){    
    console.log($event.target.checked)
    if (this.usuario.aprobado != $event.target.checked) {
      this.database.actualizarEspecialista(this.usuario.id, $event.target.checked).then(()=>{
        this.detalleUsuario.emit(this.usuarios[index])
      })
    }
  }

  marcarUsuario(index:number){
    const buttonElement = document.getElementById(String(index));
    if (buttonElement) {
      buttonElement.style.backgroundColor = "rgb(187, 187, 187)";
      if (this.usuarioAnterior) {
        this.usuarioAnterior.style.backgroundColor = "";
      }
      this.usuarioAnterior = buttonElement;
    }
  }

  exportarExcel() {
    // 1. Define los datos en formato JSON
    let datos : any = [];

    setTimeout(async() => {
      switch (this.usuario.tipoUsuario){
        case 'especialista':
          this.turnos.forEach(async turno => {
            if (turno.especialista.id == this.usuario.id) {
              let data = {
                paciente:`${turno.paciente.nombre} ${turno.paciente.apellido}`,
                especialidad:`${turno.especialidad}`,
                fecha:`${turno.dia}`
              };
              datos.push(data);
            }
          });
          console.log(datos);
          break;

        case 'paciente':
          this.turnos.forEach(async turno => {
            if (turno.paciente.id == this.usuario.id) {
              let data = {
                especialista:`${turno.especialista.nombre} ${turno.especialista.apellido}`,
                especialidad:`${turno.especialidad}`,
                fecha:`${turno.dia}`
              };
              datos.push(data);
            }
          });
          console.log(datos);
          break;

        default:
          return;
      }

      console.log(datos.length)
      if (datos.length == 0){
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "¡No tiene turnos!",
        });
        return;
      }
      // 2. Convierte los datos a una hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(datos);

       // Ajustar el ancho de las columnas
        worksheet['!cols'] = [
          { wch: 25 }, // Ancho de la columna "Nombre"
          { wch: 25 }, // Ancho de la columna "Apellido"
          { wch: 25 }, // Ancho de la columna "Historia"
        ];


      // 3. Crea un libro de trabajo (workbook) y añade la hoja
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes');

      // 4. Genera el archivo Excel y guárdalo
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // 5. Usa FileSaver para descargarlo
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `HistorialClinico-${this.usuario.nombre}-${this.usuario.apellido}-${this.usuario.tipoUsuario}.xlsx`);
    }, 100);



    
  }
}
