import { Component, inject } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { Subscription } from 'rxjs';
import { ListadoTurnosComponent } from '../listado-turnos/listado-turnos.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [ListadoTurnosComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss'
})
export class TurnosComponent {
  database = inject(DatabaseService);
  fb = inject(FormBuilder);
  formGroup : FormGroup;
  turnos : any[] = [];

  constructor(){
    this.database.traerUsuarios('turnos').subscribe((turno:any)=>{
      this.turnos = turno;
    })

    this.formGroup = this.fb.group({
      filtrar: [""],

    });
  }

}
