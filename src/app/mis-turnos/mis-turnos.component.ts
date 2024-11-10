import { Component, inject } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListadoTurnosComponent } from '../listado-turnos/listado-turnos.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [ListadoTurnosComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent {
  auth = inject(AuthService);
  database = inject(DatabaseService);
  fb = inject(FormBuilder);
  formGroup : FormGroup;
  turnos : any[] = [];
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
      filtrarEspecialista : [""],
      filtrarEspecialidad : [""],
    });
  }
}
