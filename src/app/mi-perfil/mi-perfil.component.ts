import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.scss'
})
export class MiPerfilComponent {
  auth = inject(AuthService);
  database = inject(DatabaseService)
  fb = inject(FormBuilder);
  formGroup : FormGroup;

  flagLoader = false;

  mensaje : string = "Guardando...";
  especializaciones : string = "";
  horariosDisponibles : string[] = [ "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
      "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
      "17:00", "17:30", "18:00", "18:30", "19:00"];

  horariosSabado : string[] = [ "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
      "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
      "14:00"];

  especializacionesLista : any[] = [];

  constructor(){
    this.horariosDisponibles;
    console.log(this.auth.especialista)
    this.auth.especialista.especializaciones.forEach((element:any) => {
      this.especializaciones += `»${element} \n`
      this.especializacionesLista.push(element)
    });

    this.formGroup = this.fb.group({
      inicioLunes: ["",[Validators.required, , this.notZeroValidator()]],
      inicioMartes: ["",[Validators.required, , this.notZeroValidator()]],
      inicioMiercoles: ["",[Validators.required, , this.notZeroValidator()]],
      inicioJueves: ["",[Validators.required, , this.notZeroValidator()]],
      inicioViernes: ["",[Validators.required, , this.notZeroValidator()]],
      inicioSabado: ["",[Validators.required, , this.notZeroValidator()]],

      finLunes: ["",[Validators.required, , this.notZeroValidator()]],
      finMartes: ["",[Validators.required, , this.notZeroValidator()]],
      finMiercoles: ["",[Validators.required, , this.notZeroValidator()]],
      finJueves: ["",[Validators.required, , this.notZeroValidator()]],
      finViernes: ["",[Validators.required, , this.notZeroValidator()]],
      finSabado: ["",[Validators.required, , this.notZeroValidator()]],

      especialidadLunes: ["",[Validators.required, , this.notZeroValidator()]],
      especialidadMartes: ["",[Validators.required, , this.notZeroValidator()]],
      especialidadMiercoles: ["",[Validators.required, , this.notZeroValidator()]],
      especialidadJueves: ["",[Validators.required, , this.notZeroValidator()]],
      especialidadViernes: ["",[Validators.required, , this.notZeroValidator()]],
      especialidadSabado: ["",[Validators.required, , this.notZeroValidator()]],
      },{
        validators: this.horarioValidator() // Aplica el validador de grupo aquí
      }
    );
  }

  notZeroValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      return control.value === '0' ? { notZero: true } : null;
    };
  }

  horarioValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
      
      for (let dia of dias) {
        const inicioControl = formGroup.get(`inicio${dia}`);
        const finControl = formGroup.get(`fin${dia}`);
        console.log(`Dia: ${dia} - inicio: ${inicioControl?.value} - fin: ${finControl?.value}`)
        if (inicioControl && finControl) {
          const inicioMinutos = this.convertirHoraAMinutos(inicioControl.value);
          const finMinutos = this.convertirHoraAMinutos(finControl.value);
  
          if (inicioMinutos >= finMinutos) {
            return { horarioInvalido: true };
          }
        }
      }
      return null;
    };
  }

  convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }

  guardarHorarios(){
    if (this.formGroup.invalid) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "info",
        title: "Valide bien los campos!!"
      });
      return
    }

    if (!this.auth.especialista.aprobadp) {
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "info",
        title: "No está aprobado..."
      });
      return
    }
    this.flagLoader = true
    
    let horario : any = this.generarHorario();

    this.database.actualizarHorarios(this.auth.id, 'especialistas', horario).then(()=>{
      this.flagLoader = false;
    })

  }

  generarHorario(){
    return [
      {dia:'lunes', inicio:this.formGroup.controls['inicioLunes'].value, fin:this.formGroup.controls['finLunes'].value, especialidad:this.formGroup.controls['especialidadLunes'].value},
      {dia:'martes', inicio:this.formGroup.controls['inicioMartes'].value, fin:this.formGroup.controls['finMartes'].value, especialidad:this.formGroup.controls['especialidadMartes'].value},
      {dia:'miércoles', inicio:this.formGroup.controls['inicioMiercoles'].value, fin:this.formGroup.controls['finMiercoles'].value, especialidad:this.formGroup.controls['especialidadMiercoles'].value},
      {dia:'jueves', inicio:this.formGroup.controls['inicioJueves'].value, fin:this.formGroup.controls['finJueves'].value, especialidad:this.formGroup.controls['especialidadJueves'].value},
      {dia:'viernes', inicio:this.formGroup.controls['inicioViernes'].value, fin:this.formGroup.controls['finViernes'].value, especialidad:this.formGroup.controls['especialidadViernes'].value},
      {dia:'sábado', inicio:this.formGroup.controls['inicioSabado'].value, fin:this.formGroup.controls['finSabado'].value, especialidad:this.formGroup.controls['especialidadSabado'].value},
    ]
  }
  
}
