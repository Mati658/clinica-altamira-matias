import { Component, EventEmitter, inject, input, Input, Output } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { FilterPipePipe } from '../pipes/filter-pipe.pipe';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-listado-turnos',
  standalone: true,
  imports: [FormsModule, FilterPipePipe],
  templateUrl: './listado-turnos.component.html',
  styleUrl: './listado-turnos.component.scss'
})
export class ListadoTurnosComponent {
  database = inject(DatabaseService);
  auth = inject(AuthService);
  turnoAnterior : any;
  especialistaSeleccionado : any;
  pacienteSeleccionado : any;
  @Input() filtrarEspecialidad : string = "";
  @Input() filtrarEspecialista : string = "";

  @Input() turnos:any[] = [];
  turno : any;

  seleccionarTurno(index : number, turno : any){
    this.marcarTurno(index);
    this.turno = turno;
    console.log(this.turno)
  }

  marcarTurno(index:number){
    const buttonElement = document.getElementById(String(index));
    if (buttonElement) {
      buttonElement.style.backgroundColor = "rgb(187, 187, 187)";
      if (this.turnoAnterior) {
        this.turnoAnterior.style.backgroundColor = "";
      }
      this.turnoAnterior = buttonElement;
    }
  }

  cancelarTurno(){
    Swal.fire({
      title: "Explique el por qué",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      showLoaderOnConfirm: true,
      preConfirm: async (mensaje) => {
        this.database.actualizarEstadoTurno(this.turno.id, 'Cancelado')
        if (this.auth.perfil == 'Especialista') {
          this.database.actualizarMensajeTurno(this.turno.id, mensaje)
        }else{
          this.database.actualizarCalificacionTurno(this.turno.id, mensaje)
        }
        console.log(mensaje)
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: `Turno cancelado`,
          icon: "success"
        });
      }
    });
  }

  verResenia(){
    setTimeout(() => {
      Swal.fire({
        title: this.auth.perfil == 'Paciente' ? 'Diagnóstico:' : 'Reseña:',
        text: this.auth.perfil == 'Paciente' ? this.turno.mensaje : this.turno.calificacion
      });
    }, 100);
  }

  calificarTurno(){
    Swal.fire({
      title: "Déjenos su experiencia.",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Enviar",
      showLoaderOnConfirm: true,
      preConfirm: async (calificacion) => {
        this.database.actualizarCalificacionTurno(this.turno.id, calificacion)
        console.log(calificacion)
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: `Muchas Gracias :)`,
          icon: "success"
        });
      }
    });
  }

  aceptarTurno(){
    setTimeout(() => {
      this.database.actualizarEstadoTurno(this.turno.id, 'Aceptado')
    }, 100);
  }

  rechazarTurno(){
    Swal.fire({
      title: "Explique el por qué",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      showLoaderOnConfirm: true,
      preConfirm: async (mensaje) => {
        this.database.actualizarEstadoTurno(this.turno.id, 'Rechazado')
        this.database.actualizarMensajeTurno(this.turno.id, mensaje)
        console.log(mensaje)
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: `Turno rechazado`,
          icon: "success"
        });
      }
    });
  }

  finalizarTurno(){
    Swal.fire({
      title: "Deje su diagnóstico.",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Enviar",
      showLoaderOnConfirm: true,
      preConfirm: async (mensaje) => {
        this.database.actualizarEstadoTurno(this.turno.id, 'Finalizado')
        this.database.actualizarMensajeTurno(this.turno.id, mensaje)
        console.log(mensaje)
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: `Muchas Gracias :)`,
          icon: "success"
        });
      }
    });
  }
}
