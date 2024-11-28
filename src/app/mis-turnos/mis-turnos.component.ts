import { Component, inject, Input } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListadoTurnosComponent } from '../listado-turnos/listado-turnos.component';
import { AuthService } from '../services/auth.service';
import { CargaHistorialComponent } from '../carga-historial/carga-historial.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [ListadoTurnosComponent, FormsModule, ReactiveFormsModule, CargaHistorialComponent, CommonModule, ClickOutsideDirective],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent {
  auth = inject(AuthService);
  database = inject(DatabaseService);
  fb = inject(FormBuilder);
  formGroup : FormGroup;
  turnos : any[] = [];
  mostrarCargaHistorial : boolean = false;
  flagAnim : boolean = true;
  historial : any = null;
  turnoActual : any = null;

  constructor(){
    this.database.traerUsuarios('turnos').subscribe((turnos:any)=>{
      setTimeout(() => {
        this.turnos = [];
        if (this.auth.perfil == 'Paciente') { 
          turnos.forEach((turno:any) => {
            if (turno.paciente.mail == this.auth.auth.currentUser?.email) {
              this.turnos.push(turno);
            }
          });
          return
        }
        if (this.auth.perfil == 'Especialista') { 
          turnos.forEach((turno:any) => {
            if (turno.especialista.mail == this.auth.auth.currentUser?.email) {
              this.turnos.push(turno);
            }
          });
        }
      }, 1000);
        
    })

    this.formGroup = this.fb.group({
      filtrar : [""],
    });
  }

  recibirFlag(flag : any){
    this.flagAnim = flag
    setTimeout(async () => {
      this.mostrarCargaHistorial = flag;
    }, 500);
    // console.log(this.mostrarCargaHistorial)
  }

  recibirHistorial(historial : any){
    this.historial = historial;
    this.mostrarCargaHistorial = false;
    this.database.actualizarHistorialTurno(this.turnoActual.id, historial)
    Swal.fire({
      title: `¡Historial enviado!`,
      icon: "success"
    });
    console.log(historial)
    console.log(this.turnoActual.id)
  }

  cerrarHistorial(){
    this.flagAnim = false
    setTimeout(async () => {
      this.mostrarCargaHistorial = false;
      this.flagAnim = true;
    }, 500);
  }

  recibirTurno(turno:any){
    this.turnoActual = turno;
  }
}
