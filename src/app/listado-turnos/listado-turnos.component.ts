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
  @Input() filtrar: string = "";


  @Input() turnos:any[] = [];

  @Output() cargaHistorial : EventEmitter<boolean> = new EventEmitter<boolean>;
  @Output() turnoEnviado : EventEmitter<any> = new EventEmitter<any>;

  turno : any;

  seleccionarTurno(index : number, turno : any){
    this.marcarTurno(index);
    this.turno = turno;
    this.turnoEnviado.emit(turno)
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
      let comentario : string = "";
      if (this.auth.perfil == 'Paciente') {
        comentario = this.turno.mensaje ? this.turno.mensaje : this.turno.calificacion
      }

      Swal.fire({
        title: this.auth.perfil == 'Paciente' ? 'Diagnóstico:' : 'Reseña:',
        text: this.auth.perfil == 'Paciente' ? comentario : this.turno.calificacion
      });
    }, 100);
  }

  completarEncuesta(){
    Swal.fire({
      title: "Califíque su experiencia :D",
      position: 'center',
      html: `
       <style>
        .rating {
          justify-content: center;
          align-items: center;
          align-self: center;
          display: flex;
          flex-direction: row-reverse;
          gap: 0.3rem;
          --stroke: #666;
          --fill: #ffc73a;
        }
        .rating input {
          appearance: unset;
        }
        .rating label {
          cursor: pointer;
        }
        .rating svg {
          width: 2rem;
          height: 2rem;
          overflow: visible;
          fill: transparent;
          stroke: var(--stroke);
          stroke-linejoin: bevel;
          stroke-dasharray: 12;
          animation: idle 4s linear infinite;
          transition: stroke 0.2s, fill 0.5s;
        }
        @keyframes idle {
          from { stroke-dashoffset: 24; }
        }
        .rating label:hover svg {
          stroke: var(--fill);
        }
        .rating input:checked ~ label svg {
          transition: 0s;
          animation: idle 4s linear infinite, yippee 0.75s backwards;
          fill: var(--fill);
          stroke: var(--fill);
          stroke-opacity: 0;
          stroke-dasharray: 0;
          stroke-linejoin: miter;
          stroke-width: 8px;
        }
        @keyframes yippee {
          0% { transform: scale(1); fill: var(--fill); fill-opacity: 0; stroke-opacity: 1; stroke: var(--stroke); stroke-dasharray: 10; stroke-width: 1px; stroke-linejoin: bevel; }
          30% { transform: scale(0); fill: var(--fill); fill-opacity: 0; stroke-opacity: 1; stroke: var(--stroke); stroke-dasharray: 10; stroke-width: 1px; stroke-linejoin: bevel; }
          30.1% { stroke: var(--fill); stroke-dasharray: 0; stroke-linejoin: miter; stroke-width: 8px; }
          60% { transform: scale(1.2); fill: var(--fill); }
        }
      </style>


      <div class="rating">
        <input type="radio" id="star-5" name="star-rating" value="5">
        <label for="star-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path pathLength="360" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg>
        </label>
        <input type="radio" id="star-4" name="star-rating" value="4">
        <label for="star-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path pathLength="360" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg>
        </label>
        <input type="radio" id="star-3" name="star-rating" value="3">
        <label for="star-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path pathLength="360" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg>
        </label>
        <input type="radio" id="star-2" name="star-rating" value="2">
        <label for="star-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path pathLength="360" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg>
        </label>
        <input type="radio" id="star-1" name="star-rating" value="1">
        <label for="star-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path pathLength="360" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"></path></svg>
        </label>
      </div>
      `,
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      showLoaderOnConfirm: true,
      preConfirm: async (mensaje) => {
        const selectedRating = (document.querySelector('input[name="star-rating"]:checked') as HTMLInputElement)?.value;
        return selectedRating;
      }
      }).then((result) => {
        if (result.isConfirmed) {
          const rating = result.value;
          this.database.actualizarExpTurno(this.turno.id, rating);
        }
      });
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
