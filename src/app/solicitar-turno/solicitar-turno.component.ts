import { Component, inject } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Turno } from '../../classes/turno';
import Swal from 'sweetalert2';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, LoaderComponent],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.scss'
})
export class SolicitarTurnoComponent {
  database = inject(DatabaseService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  
  horariosDisponibles : string[] = [];

  especializaciones : any[] = [];
  especialistas : any[] = [];
  pacientes : any[] = [];
  fechas: any[] = [];
  fechaAnterior : any;
  fechaSeleccionada : string = "";
  horarioSeleccionado : string = "";
  fechaCompletaSeleccionada : any;
  especialistaSeleccionado : any;
  pacienteSeleccionado : any;
  nombreEspecialista = "";  
  flagLoader : boolean = false;
  mensaje : string = "Guardando turno...";
  especialidad : string = "";
  especialista : string = "";
  formGroup : FormGroup;

  btnEspecialistaAnterior : any;
  btnEspecialidadAnterior : any;
  btnHorarioAnterior : any;
  constructor(){
    this.generarFechas();
    this.database.traerEspecializaciones().subscribe(res=>{
      this.especializaciones = res;
      console.log(JSON.parse(this.especializaciones[0].especialidadesMedicas))
    }).closed
    this.database.traerUsuarios('especialistas').subscribe((usuario:any)=>{
      this.especialistas = usuario;
    }).closed
    this.database.traerUsuarios('pacientes').subscribe((usuario:any)=>{
      this.pacientes = usuario;
    }).closed

    this.formGroup = this.fb.group({
      paciente: ["Paciente",[Validators.required]],
    });
    if (this.auth.paciente) {
      this.pacienteSeleccionado = this.auth.paciente;
      console.log(this.pacienteSeleccionado)
    }

    
  }

  generarFechas(): void {
    const hoy = new Date();
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };

    for (let i = 1; i < 16; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);

      const diaFormateado = fecha.toLocaleDateString('es-ES', opciones);
      

      // Formato 'dd/mm'
      const dia = fecha.getDate().toString().padStart(2, '0'); // Asegura dos dígitos
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Mes en dos dígitos
      const fechaFormateada = `${dia}/${mes}`;


      this.fechas.push({dia: diaFormateado, fecha: fechaFormateada});
    }
    console.log(this.fechas)

  }

  getDia(dia:string){
    let indice : number = -1;
    switch (dia) {
      case 'lunes':
        indice = 0;
        break;
  
      case 'martes':
        indice = 1;
        break;

      case 'miércoles':
        indice = 2;
        break;
      
      case 'jueves':
        indice = 3;
          break;
      
      case 'viernes':
        indice = 4;
          break;

      case 'sábado':
        indice = 5;
          break;
    }

    return indice;
  }

  generarHorarios() : string[]{

    let horarioDefault = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
      "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
      "17:00", "17:30", "18:00", "18:30", "19:00"];

    let horarios :string[] = []
    
    let indice = this.getDia(this.fechaSeleccionada.split(",")[0]);
    let inicio = this.especialistaSeleccionado.horariosDisponibles[indice].inicio;
    let fin = this.especialistaSeleccionado.horariosDisponibles[indice].fin;

    console.log(indice)
    console.log(inicio)
    console.log(fin)


    horarios = horarioDefault.filter(hora => {
      const horaMinutos = hora;
      return horaMinutos >= inicio && horaMinutos <= fin;
    });

    console.log(horarios)

    return horarios;
  }

  seleccionarFecha(index : number){
    this.marcarFecha(index);
    this.fechaSeleccionada = this.fechas[index].dia;
    console.log(this.fechaSeleccionada);
    this.fechaCompletaSeleccionada = this.fechas[index];
    if (this.especialistaSeleccionado && this.fechaSeleccionada) {
      this.horariosDisponibles = this.generarHorarios();
      this.obtenerHorarios()
    }
  }

  marcarFecha(index:number){
    const buttonElement = document.getElementById(String(index));
    if (this.fechaAnterior != buttonElement) {
      if (buttonElement) {
        buttonElement.style.backgroundColor = "rgb(187, 187, 187)";
        if (this.fechaAnterior) {
          this.fechaAnterior.style.backgroundColor = "";
        }
        this.fechaAnterior = buttonElement;
      }
    }
  }

  async obtenerHorarios(){
    console.log(this.especialistaSeleccionado) 
    console.log(this.fechaCompletaSeleccionada) 
    for await (let turno of this.especialistaSeleccionado.turnos) {
      turno = JSON.parse(turno);
      console.log(turno.dia) 

      if (turno.dia == this.fechaCompletaSeleccionada.dia) {
        let indice = this.horariosDisponibles.indexOf(turno.horario);
        if (indice != -1) {
          this.horariosDisponibles.splice(indice, 1);
        }
      }
    }

    if (this.pacienteSeleccionado) {
      console.log(this.pacienteSeleccionado)
      for await (let turno of this.pacienteSeleccionado.turnos) {
        turno = JSON.parse(turno);
        if (turno.dia == this.fechaCompletaSeleccionada.dia) {
          let indice = this.horariosDisponibles.indexOf(turno.horario);
          if (indice != -1) {
            this.horariosDisponibles.splice(indice, 1);
          }
        }
      }
    }

    console.log(this.horariosDisponibles)

  }

  recibirEspecialista(data : any, index : string){
    if (this.btnEspecialistaAnterior) {
      this.btnEspecialistaAnterior.classList.remove("animar");
    }

    const buttonElement = document.getElementById(String(index));
    if (buttonElement) { 
      buttonElement.classList.add("animar");
      this.btnEspecialistaAnterior = buttonElement;
    }

    console.log(data)
    if (data) {
      this.especialistaSeleccionado = data;
    }
   
    if (this.fechaSeleccionada) {
      this.horariosDisponibles = this.generarHorarios();
      this.obtenerHorarios()
    }

    this.nombreEspecialista = `${this.especialistaSeleccionado.nombre} ${this.especialistaSeleccionado.apellido}`
  }

  recibirEspecialidad(data : any, index : string){
    if (this.btnEspecialidadAnterior) {
      this.btnEspecialidadAnterior.classList.remove("animar");
      this.btnEspecialistaAnterior.classList.remove("animar");
      this.especialistaSeleccionado = "";
    }
    
    const buttonElement = document.getElementById(String(index));
    if (buttonElement) { 
      buttonElement.classList.add("animar");
      this.btnEspecialidadAnterior = buttonElement;
    }
    data = JSON.parse(data);
    if (data) {
      this.especialidad = data.esp;
      console.log(this.especialidad)
    }

    if (this.fechaSeleccionada) {
      this.horariosDisponibles = this.generarHorarios();
      this.obtenerHorarios()
    }
  }

  recibirHorario(data:any, index : string){
    if (this.btnHorarioAnterior) {
      this.btnHorarioAnterior.classList.remove("animar");
    }
    
    const buttonElement = document.getElementById(String(index));
    if (buttonElement) { 
      buttonElement.classList.add("animar");
      this.btnHorarioAnterior = buttonElement;
    }
    if (data) {
      this.horarioSeleccionado = data;
      console.log(this.horarioSeleccionado)
    }
  }

  recibirPaciente(event : Event){
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value != "0") {
      this.horariosDisponibles = this.generarHorarios();
      this.pacienteSeleccionado = JSON.parse(selectElement.value);
      this.horariosDisponibles = this.generarHorarios();
      this.obtenerHorarios()
    }
  }

  realizarReserva(){
    if (!this.fechaSeleccionada || this.formGroup.invalid || !this.horarioSeleccionado || !this.especialistaSeleccionado || !this.especialidad || (this.formGroup.controls['paciente'].value == 'Paciente' && this.auth.perfil == 'Administrador')) {
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
        title: "Llene todos los campos!!"
      });
      return
    }
    this.flagLoader = true;
    let horario = JSON.stringify({dia:this.fechaCompletaSeleccionada.dia, horario:this.horarioSeleccionado})
    console.log(horario)
    let turno! : Turno;
    if (this.auth.perfil == 'Paciente') { 
      this.database.actualizarTurnos(this.auth.id, 'pacientes', horario).then(()=>{
        turno = new Turno(this.horarioSeleccionado, this.fechaCompletaSeleccionada.dia, this.auth.paciente, this.especialistaSeleccionado, this.especialidad);
        this.database.agregarColeccion('turnos',turno);
        this.flagLoader = false;
        Swal.fire({
          title: "¡Turno Guardado!",
          icon: "success"
        });
        this.limpiar();
        this.database.obtenerDocPorId('pacientes', this.auth.id).subscribe(doc=>{
          this.pacienteSeleccionado = doc.data();
          console.log(this.pacienteSeleccionado)
        });
      });
    }else{
      this.database.actualizarTurnos(this.pacienteSeleccionado.id, 'pacientes', horario).then(()=>{
        turno = new Turno(this.horarioSeleccionado, this.fechaCompletaSeleccionada.dia, this.pacienteSeleccionado, this.especialistaSeleccionado, this.especialidad);
        this.database.agregarColeccion('turnos',turno);
        this.flagLoader = false;
        Swal.fire({
          title: "¡Turno Guardado!",
          icon: "success"
        });
        this.limpiar();
      });
    }
    this.database.actualizarTurnos(this.especialistaSeleccionado.id, 'especialistas', horario);  
  }

  jsonStringify(obj: any): string {
    return JSON.stringify(obj);
  }

  jsonParse(obj : string){
    return JSON.parse(obj)
  }

  limpiar(){
    this.especialidad = "";
    this.especialistaSeleccionado = "";
    this.horarioSeleccionado = "";
    this.btnHorarioAnterior.classList.remove("animar");;
    this.btnEspecialidadAnterior.classList.remove("animar");;
    this.btnEspecialistaAnterior.classList.remove("animar");;
    this.formGroup.controls["paciente"].setValue("Paciente");
  }
}
