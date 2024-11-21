import { Component, inject, Input } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListadoTurnosComponent } from '../listado-turnos/listado-turnos.component';
import { AuthService } from '../services/auth.service';
import { CargaHistorialComponent } from '../carga-historial/carga-historial.component';
import { CommonModule } from '@angular/common';
import { ListadoHistorialComponent } from "../listado-historial/listado-historial.component";

@Component({
  selector: 'app-seccion-pacientes',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, ListadoHistorialComponent],
  templateUrl: './seccion-pacientes.component.html',
  styleUrl: './seccion-pacientes.component.scss'
})
export class SeccionPacientesComponent {
  auth = inject(AuthService);
  database = inject(DatabaseService);
  turnos : any[] = [];
  mostrarCargaHistorial : boolean = false;
  historial : any = null;
  turnoActual : any = null;

  constructor(){
    this.database.traerUsuarios('turnos').subscribe((turnos:any)=>{
      setTimeout(() => {
        this.turnos = [];
        if (this.auth.perfil == 'Especialista') { 
          console.log(turnos)
          turnos.forEach((turno:any) => {
            if (turno.paciente.atendidoPor) {
              console.log(turno.paciente.id)
              this.database.obtenerDocPorId('pacientes', turno.paciente.id).subscribe(doc=>{
                let paciente : any = doc.data();
                if (paciente.atendidoPor.includes(this.auth.especialista.id)) {
                  this.turnos.push(turno);
                  console.log(this.turnos)
                }
              }).closed;    
            }
          });
        }
      }, 1000);
        
    })
  }


  recibirTurno(turno:any){
    this.turnoActual = turno;
  }
}
