import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-detalle-usuario',
  standalone: true,
  imports: [],
  templateUrl: './detalle-usuario.component.html',
  styleUrl: './detalle-usuario.component.scss'
})
export class DetalleUsuarioComponent {


  @Input() set obtenerDetalleUsuario(usuario : any){
    if (usuario) {
      this.actualizarDetalle(usuario);
    }
  }

  actualizarDetalle(usuario:any){
    console.log(usuario);
    let head : string = `<th style="padding-right: 4vh;">Imagenes</th>
                <th style="padding-right: 11vh; text-align: center;">Nombre</th>
                <th style="padding-right: 11vh; text-align: center;">Apellido</th>
                <th style="padding-right: 11vh; text-align: center;">Edad</th>
                <th style="padding-right: 11vh; text-align: center;">DNI</th>
                <th style="padding-right: 11vh; text-align: center;">Mail</th>`
    let tabla : string = ""
    tabla += `
    <tr>
      <td>
        <img src="${usuario.imagenes[0]}" width="50" height="50">
        <br>
        <img src="${usuario.imagenes[1]}" width="50" height="50">
      </td>
      <td>${usuario.nombre}</td>   
      <td>${usuario.apellido}</td>
      <td>${usuario.edad}</td>
      <td>${usuario.dni}</td>
      <td>${usuario.mail}</td>
    `;
    switch (usuario.tipoUsuario) {
      case 'paciente':
        head += `<th>Obra Social</th>`;
        tabla += `<td>${usuario.obraSocial}</td>
                  </tr>`
        break;
    
      case 'especialista':
        head += `
        <th>Especializaciones</th>
        <th>Aprobado</th>
        `;

        let especializaciones = "";
        usuario.especializaciones.forEach((element:any) => {
          especializaciones += `»${element} <br>`
        });
        let aprobado = usuario.aprobado == true ? "✔" : "❌";
        tabla += `<td>${especializaciones}</td>
                  <td>${aprobado}</td>
                  </tr>`
        break;

      case 'administrador':
        tabla += `</tr>`
        break;
    }
    
    (<HTMLElement>document.getElementById("head-usuario")).innerHTML = head;
    (<HTMLElement>document.getElementById("table_usuario")).innerHTML = tabla;

  }
}
