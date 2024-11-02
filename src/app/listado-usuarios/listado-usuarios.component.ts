import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-listado-usuarios',
  standalone: true,
  imports: [],
  templateUrl: './listado-usuarios.component.html',
  styleUrl: './listado-usuarios.component.scss'
})
export class ListadoUsuariosComponent {
  database = inject(DatabaseService);
  usuarioAnterior : any;

  @Input() usuarios:any[] = [];
  @Output() detalleUsuario : EventEmitter<any> = new EventEmitter<any>;
  usuario : any;

  seleccionarUsuario(index : number){
    this.marcarUsuario(index);
    this.usuario = this.usuarios[index];
    this.detalleUsuario.emit(this.usuarios[index]);
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
}
