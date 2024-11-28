import { Component, inject } from '@angular/core';
import { DatabaseService } from '../services/database.service';
import Chart from 'chart.js/auto'
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss'
})
export class LogsComponent {
  database = inject(DatabaseService);
  
  //Para hacer el gráfico
  diasIngreso : any = [
    {dia:'lunes', puntos: 0},
    {dia:'martes', puntos: 0},
    {dia:'miércoles', puntos: 0},
    {dia:'jueves', puntos: 0},
    {dia:'viernes', puntos: 0},
    {dia:'sábado', puntos: 0}
  ]

  meses: Record<string, number> = {
    enero: 0,
    febrero: 1,
    marzo: 2,
    abril: 3,
    mayo: 4,
    junio: 5,
    julio: 6,
    agosto: 7,
    septiembre: 8,
    octubre: 9,
    noviembre: 10,
    diciembre: 11,
  };

  logIngreso : any = []
  diasTurnos : any = []
  turnosDisponibles : any = []
  TurnosSolicitados : any = []
  TurnosFinalizados : any = []
  especialidades : any[] = []
  especialistas : any[] = [];
  especialistaSeleccionado : any = null;
  graficoTurnosSolicitados : any = null;
  graficoTurnosFinalizados : any = null;
  fechaInicio : number = 0;
  fechaFinal : number = -1;



  constructor(){
    this.database.traerUsuarios('especialistas').subscribe((usuario:any)=>{
      this.especialistas = usuario;
    }).closed
    this.logIngresos();
    this.obtenerEspecialidades();
    this.obtenerDias();
    this.obtenerTurnosSolicitados();
    this.obtenerTurnosFinalizados();
  }

  recibirEspecialista(event : Event){
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value != "0") {
      this.especialistaSeleccionado = JSON.parse(selectElement.value);
      if (this.graficoTurnosSolicitados) {
        console.log(this.graficoTurnosFinalizados)
        this.graficoTurnosSolicitados.destroy();
        this.graficoTurnosFinalizados.destroy();
      }
      this.obtenerTurnosSolicitados();
      this.obtenerTurnosFinalizados();
      
      console.log(this.especialistaSeleccionado)
    }
  }

  async recibirFechaInicio(event : Event){
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value != "0") {
      let contador : number = 0;
      for await (const element of this.turnosDisponibles) {
        contador++
        if (element.dia == selectElement.value) {
          this.fechaInicio = contador;
          this.actualizarGraficos()
          break;
        }
      }
      console.log(this.fechaInicio)
    }
  }

  async recibirFechaFinal(event : Event){
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement.value != "0") {
      let contador : number = 0;
      console.log(this.turnosDisponibles)
      for await (const element of this.turnosDisponibles) {
        contador++
        if (element.dia == selectElement.value) {
          this.fechaFinal = contador;
          this.actualizarGraficos()
          break;
        }
      }
      console.log(this.fechaFinal)
    }
  }

  jsonStringify(obj: any): string {
    return JSON.stringify(obj);
  }

  actualizarGraficos(){
    this.graficoTurnosSolicitados.destroy();
    this.graficoTurnosFinalizados.destroy();
    this.obtenerTurnosSolicitados();
    this.obtenerTurnosFinalizados();
  }

  //#region Logs
  logIngresos(){
    let contador = 0;
    let suscripcion = this.database.traerUsuarios('logIngresos').subscribe((turnos:any)=>{
      const totalTurnos = turnos.length;
      this.logIngreso = turnos
      turnos.forEach(async(turno:any) => {
        this.diasIngreso.forEach(async(dia:any) => {
          if (dia.dia == turno.dia.split('-').shift()) {
            dia.puntos++;
          }
        });
        contador++;
      });

      if (contador === totalTurnos) {
        this.graficoBarras(this.diasIngreso, 'dia', 'graficoBarras', 'Ingresos');
        suscripcion.unsubscribe(); 
      }

    })
  }

  logTurnosEspecialidad(){
    let contador = 0;
    let suscripcion = this.database.traerUsuarios('turnos').subscribe((turnos:any)=>{
      const totalTurnos = turnos.length;
      turnos.forEach(async(turno:any) => {
        this.especialidades.forEach(async(especialidad:any) => {
          if (especialidad.especilaidad == turno.especialidad) {
            especialidad.puntos++;
          }
        });
        contador++;
      });

      console.log(contador)
      if (contador === totalTurnos) {
        console.log(this.especialidades)
        this.graficoPolar(this.especialidades, 'especilaidad', 'graficoPolar', 'Cantidad')
        suscripcion.unsubscribe(); 
      }

    })
    console.log(this.diasIngreso)
  }

  logTurnosDia(){
    let contador = 0;
    let suscripcion = this.database.traerUsuarios('turnos').subscribe(async(turnos:any)=>{
      const totalTurnos = turnos.length;
      for await (const turno of turnos) {
        this.diasTurnos.forEach(async(dia:any) => {
          if (dia.dia == turno.dia) {
            dia.puntos++;
          }
        });
        contador++;    
      }
    
      if (contador === totalTurnos) {
        console.log(this.diasTurnos)
        this.ordenarFechas(this.diasTurnos)
        this.graficoLinea(this.diasTurnos, 'dia', 'graficoLinea', 'Cantidad de Turnos');
        
        suscripcion.unsubscribe(); 
      }
    })
  }


  logTurnosSolicitado(){
    let contador = 0;
    let suscripcion = this.database.traerUsuarios('turnos').subscribe(async(turnos:any)=>{
      const totalTurnos = turnos.length;
      for await (const turno of turnos) {
        this.TurnosSolicitados.forEach(async(dia:any) => {
          if (dia.dia == turno.dia && turno.especialista.id == this.especialistaSeleccionado.id) {
            dia.puntos++;
          }
        });
        contador++;    
      }
    
      if (contador === totalTurnos) {
        this.turnosDisponibles = this.ordenarFechas(this.TurnosSolicitados);
        console.log(this.turnosDisponibles)
        this.TurnosSolicitados = this.obtenerLapso(this.turnosDisponibles, this.fechaInicio!=0 ? this.fechaInicio-1: 0, this.fechaFinal);
        console.log(this.TurnosSolicitados);
        this.graficoSolicitados(this.TurnosSolicitados, 'dia', 'graficoLineaSolicitados', 'Turnos Solicitado');
        suscripcion.unsubscribe(); 
      }
    })
  }

  logTurnosFinalizados(){
    let contador = 0;
    let suscripcion = this.database.traerUsuarios('turnos').subscribe(async(turnos:any)=>{
      const totalTurnos = turnos.length;
      for await (const turno of turnos) {
        this.TurnosFinalizados.forEach(async(dia:any) => {
          if (dia.dia == turno.dia && turno.estado == 'Finalizado' && turno.especialista.id == this.especialistaSeleccionado.id) {
            dia.puntos++;
          }
        });
        contador++;    
      }
    
      if (contador === totalTurnos) {
        this.ordenarFechas(this.TurnosFinalizados);
        this.TurnosFinalizados = this.obtenerLapso(this.TurnosFinalizados, this.fechaInicio!=0 ? this.fechaInicio-1: 0, this.fechaFinal);
        console.log(this.TurnosFinalizados);
        this.graficoFinalizados(this.TurnosFinalizados, 'dia', 'graficoLineaFinalizados', 'Turnos Finalizados');
        suscripcion.unsubscribe(); 
      }
    })
  }


  obtenerLapso(lista:any[], inicio:number, fin:number){
    // console.log(lista.slice(inicio,lista.length));
    console.log(lista.length);
    if (inicio != 0 || fin != 0) {
      return lista.slice(inicio,fin!=-1 ? fin : lista.length)
    }
    return lista;
  }

  ordenarFechas(lista:any[]){
    return lista.sort((a:any, b:any) => {
      const fechaA = this.convertirAFecha(a.dia);
      const fechaB = this.convertirAFecha(b.dia);
      return fechaA.getTime() - fechaB.getTime();
    });
  }

  convertirAFecha(texto: string): Date {
    const [_, dia, numero, mes] = texto.match(/(\w+), (\d{1,2}) de (\w+)/) || [];
    return new Date(2024, this.meses[mes], parseInt(numero));
  }


  obtenerTurnosSolicitados(){
    let contador = 0;

    let suscripcion = this.database.traerUsuarios('turnos').subscribe(async(turnos:any)=>{
      const totalEsp = turnos.length;
      this.TurnosSolicitados = []

      for await (const element of turnos) {
        let turnoSolicitado = {dia:element.dia, especialista:`${element.especialista.nombre} ${element.especialista.apellido}` ,puntos: 0};
        let flag : boolean = false;

        if (this.TurnosSolicitados.length != 0) {
          for await (const element2 of this.TurnosSolicitados) {
            if ((element2.dia == element.dia) || (element.especialista.id != this.especialistaSeleccionado.id)) {
              flag = true;
            }
          }
          if (!flag){
            this.TurnosSolicitados.push(turnoSolicitado);
          }
        }else if(element.especialista.id == this.especialistaSeleccionado.id){
          console.log(element.especialista.id)
          this.TurnosSolicitados.push(turnoSolicitado);
        }
        contador++;
      }

      if (contador === totalEsp) {
        if (this.especialistaSeleccionado) {
          this.logTurnosSolicitado();
        }
        suscripcion.unsubscribe(); 
      }
    })
  }

  obtenerTurnosFinalizados(){
    let contador = 0;

    let suscripcion = this.database.traerUsuarios('turnos').subscribe(async(turnos:any)=>{
      const totalEsp = turnos.length;
      this.TurnosFinalizados = []

      for await (const element of turnos) {
        let turnoSolicitado = {dia:element.dia, especialista:`${element.especialista.nombre} ${element.especialista.apellido}` ,puntos: 0};
        let flag : boolean = false;

        if (this.TurnosFinalizados.length != 0) {
          for await (const element2 of this.TurnosFinalizados) {
            if ((element2.dia == element.dia) || (element.especialista.id != this.especialistaSeleccionado.id) || (element.estado != 'Finalizado')) {
              flag = true;
            }
          }
          if (!flag){
            this.TurnosFinalizados.push(turnoSolicitado);
          }
        }else if(element.especialista.id == this.especialistaSeleccionado.id){
          this.TurnosFinalizados.push(turnoSolicitado);
        }
        contador++;
      }

      if (contador === totalEsp) {
        if (this.especialistaSeleccionado) {
          this.logTurnosFinalizados();
        }
        suscripcion.unsubscribe(); 
      }
    })
  }

  obtenerEspecialidades(){
    let contador = 0;

    let suscripcion = this.database.traerEspecializaciones().subscribe((especialidades:any)=>{
      const totalEsp = especialidades.length;

      especialidades[0].especialidadesMedicas.forEach(async(element:any) => {
        let esp = {especilaidad:JSON.parse(element).esp, puntos: 0};
        this.especialidades.push(esp);
      });

      contador++;
      if (contador === totalEsp) {
        console.log(this.especialidades)
        suscripcion.unsubscribe(); 
        this.logTurnosEspecialidad();
      }
    })

  }

  obtenerDias(){
    let contador = 0;

    let suscripcion = this.database.traerUsuarios('turnos').subscribe(async(turnos:any)=>{
      const totalEsp = turnos.length;

      for await (const element of turnos) {
        let dia = {dia:element.dia, puntos: 0};
        let flag : boolean = false;

        if (this.diasTurnos.length != 0) {
          for await (const element2 of this.diasTurnos) {
            if (element2.dia == element.dia) {
              flag = true;
            }
          }
          if (!flag)
            this.diasTurnos.push(dia);
        }else{
          this.diasTurnos.push(dia);
        }
        contador++;
      }

      if (contador === totalEsp) {
        suscripcion.unsubscribe(); 
        this.logTurnosDia();
      }
    })

  }

  //#endregion

  //#region Gráficos
  
  async graficoLinea(datos:any[], labelX:string, idCanvas:string, msjLabel:string) {
    const ctx : any = (<HTMLCanvasElement>document.getElementById(idCanvas)).getContext('2d');

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datos.map((row:any) => row[labelX]),
        datasets: [
          {
            label: msjLabel,
            data: datos.map((row:any) => row.puntos),
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          }
        },
        onClick: (event:any) => {
          const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
          if (activePoints.length > 0) {
            const index = activePoints[0].index; // Obtener el índice de la barra clicada
          }
        }
      }
    });
  };

  async graficoSolicitados(datos:any[], labelX:string, idCanvas:string, msjLabel:string) {
    const ctx : any = (<HTMLCanvasElement>document.getElementById(idCanvas)).getContext('2d');

    this.graficoTurnosSolicitados = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datos.map((row:any) => row[labelX]),
        datasets: [
          {
            label: msjLabel,
            data: datos.map((row:any) => row.puntos),
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          }
        },
        onClick: (event:any) => {
          const activePoints = this.graficoTurnosSolicitados.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
          if (activePoints.length > 0) {
            const index = activePoints[0].index; // Obtener el índice de la barra clicada
          }
        }
      }
    });
  };

  async graficoFinalizados(datos:any[], labelX:string, idCanvas:string, msjLabel:string) {
    const ctx : any = (<HTMLCanvasElement>document.getElementById(idCanvas)).getContext('2d');

    this.graficoTurnosFinalizados = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datos.map((row:any) => row[labelX]),
        datasets: [
          {
            label: msjLabel,
            data: datos.map((row:any) => row.puntos),
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          }
        },
        onClick: (event:any) => {
          const activePoints = this.graficoTurnosFinalizados.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
          if (activePoints.length > 0) {
            const index = activePoints[0].index; // Obtener el índice de la barra clicada
          }
        }
      }
    });
  };

  async graficoBarras(datos:any[], labelX:string, idCanvas:string, msjLabel:string) {
    const ctx : any = (<HTMLCanvasElement>document.getElementById(idCanvas)).getContext('2d');

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.map((row:any) => row[labelX]),
        datasets: [
          {
            label: msjLabel,
            data: datos.map((row:any) => row.puntos),
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          }
        },
        onClick: (event:any) => {
          const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
          if (activePoints.length > 0) {
            const index = activePoints[0].index; // Obtener el índice de la barra clicada
          }
        }
      }
    });
  };

  async graficoPolar(datos:any[], labelX:string, idCanvas:string, msjLabel:string) {
    const ctx : any = (<HTMLCanvasElement>document.getElementById(idCanvas)).getContext('2d');

    const chart = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: datos.map((row:any) => row[labelX]),
        datasets: [
          {
            label: msjLabel,
            data: datos.map((row:any) => row.puntos),
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          }
        },
        onClick: (event:any) => {
          const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
          if (activePoints.length > 0) {
            const index = activePoints[0].index; // Obtener el índice de la barra clicada
          }
        }
      }
    });
  };

  //#endregion

  //#region Descargas

  descargarPDF(idCanvas:string, titulo:string){
    const canvas = document.getElementById(idCanvas) as HTMLCanvasElement;

    html2canvas(canvas).then(async (canvasElement) => {
      const imgData = canvasElement.toDataURL('image/png');
      
      let cuerpoPDF : any = {
        titulo: titulo,
        imagen:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAKACAYAAAAMzckjAAAAAXNSR0IArs4c6QAAIABJREFUeF7snQmYHFXVhr/TM5ONILssQqarE0ACskYzMyyCbIqy/wlkQkJXBwKiAgrIqkQFBBQBUcCYTHUCSRAUZFOQXSAJCKjwkwAmXR0Im/yAkECWmenzU50Bk5Bkeqnqrrr11fP4hJh7z/2+99zpOV236l4BLxIgARIgARIgARIggVgRkFi5pVkSIAESIAESIAESIAGwAOQkIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwgARIgARIgARIggZgRYAEYs4TTLgmQAAmQAAmQAAmwAOQcIAESIAESIAESIIGYEWABGLOE0y4JkAAJkAAJkAAJsADkHCABEiABEiABEiCBmBFgARizhNMuCZAACZAACZAACbAA5BwggQAIbD1ON24QbADFholuDJQElhQKWNxVwKI+/bA4N1HeC2BYhiQBEggJgc3H6HoD+mJgQrF+dzcGJhIYqILl0on/aB+8506SN0MilTJiSoAFYEwTT9ulERg8TndSxRaFAjZFT0EnwHoq2BTABgA2FMEGqthQev4OYGBp0bEEwGIAiyA9f+qKP0WxWBNYBMV7ArxWAOY0dGHu/Bvk3yXGZjMSIAEfCGw9Qvv3HYChhQR2UMVg73NAgPVFMFALWB+Cgd7fVYs/98W/F/8s/XrT+zkH8B8I3oPgP5/83fv/gPc+/rsK/j2gP56fc614nxO8SKAqAiwAq8LHziYQ2HeCNuYWYLsGxY4KDJUEdpQV/70tgKaQeXwbwBwAc1UxRxKYm1DMne/IKyHTSTkkECkC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pX6KJgESCIUADWAo2JmUBEjANAKJtH5695fBXzRNVw09j6ri/Xzsa1nXKJcEDCBAA2hAEyiBBEjADALJtF6kwJVmqKmpgse71UTEASRAAoMRoAHk2iABEiCB1xFIdOsFUCw3HMr/qqKrmJMdhuukPBIgAUMJ0AAa2hjKIgESCI/A6LROKAO3Afir8FQMmnmHlHBUfoU8baA2SiIBErCEAA2gJY2iTBIggWAJdC7ShJRwqwBHBJt5yGzbFZhTzMrNBmmiFBIgAQsJ0ABa2DRKJgESCIbA2It11LbtuE6AGcFkHDLL5lgMMzYtkycN0EIJJEAClhOgAbS8gZRPAiTgNwGVeApfFsFlfmcaLL4CD/eVcAa3egmrA8xLAu4RoAF0r6esiARIwAcCiZTOguC7AIb5EH7wkIpVnXGk1vZIf6B5mYwESMBpAjSATreXxZEACXhJYOC9wM8IMB9Au5ex9xBrPQSfK2Tkhz7nYXgSIIEIEqABjGDTWTIJkEBrBEYv1DFlxWehmLt78+i21qK9afajoujJ5+QOj+MyHAmQAAn8iQANIBcDCZAACTRJYExa9y8rTkcMp6viFABvaSKUAvgxgFtFcUs+J080EYNTSIAESKAhAjSADeHiYBIgARIYnEAypTPKgkkCHATgHQP/HQjgAAC/B/D8wH+/EuAFVfxfxzB87+kl8htyJQESIIEgCdAABkmbuUiABEiABEiABEjAAAI0gAY0gRJIgARIgARIgARIIEgCNIBB0mYuEiABEiABEiABEjCAAA2gAU2gBBIgARIgARIgARIIkgANYJC0mYsESIAESIAESIAEDCBAA2hAEyiBBEiABEiABEiABIIkQAMYJG3mIgESIAESIAESIAEDCNAAGtAESiABEiABEiABEiCBIAnQAAZJm7lIgARIgARIgARIwAACNIAGNIESSIAESIAESIAESCBIAjSAQdJmLhIgARIgARIgARIwgAANoAFNoAQSIAESIAESIAESCJIADWCQtJmLBEiABEiABEiABAwgQANoQBMogQRIgARIgARIgASCJEADGCRt5iIBEiABEiABEiABAwjQABrQBEogARIgARIgARIggSAJ0AAGSZu5SIAESIAESIAESMAAAjSABjSBEkiABEiABEiABEggSAI0gEHSZi4SIAESIAESIAESMIDA/wc/+9McyW5sJwAAAABJRU5ErkJggg==',
        grafico: imgData,
        descripcion: ``,
      };

      this.generarCuerpoPDF(cuerpoPDF, idCanvas).then(res=>{
        console.log(res);
        this.generatePDF(res)
      });
    });
  }

  descargarExcel(idCanvas:string, titulo:string){
    const canvas = document.getElementById(idCanvas) as HTMLCanvasElement;

    html2canvas(canvas).then(async (canvasElement) => {
      const imgData = canvasElement.toDataURL('image/png');

      this.generarCuerpoExcel(idCanvas).then(res=>{
        console.log(res);
        this.generateExcel(res, imgData, idCanvas)
      });
    });
  }

  async generarCuerpoPDF(cuerpoPDF : any, idCanvas:string){
    switch (idCanvas) {
      case 'graficoBarras':
        cuerpoPDF.descripcion += 'Estadísticas:\n'
        for await (const element of this.diasIngreso) {
          cuerpoPDF.descripcion+=`»${element.dia} : ${element.puntos}\n`;
        }

        cuerpoPDF.descripcion += 'Log:\n'
        for await (const element of this.logIngreso) {
          cuerpoPDF.descripcion+=`»${element.usuario} - ${element.dia} - ${element.horario} \n=======================\n`;
          
        }
        break;
      case 'graficoLinea':
        cuerpoPDF.descripcion += 'Estadísticas:\n'
        for await (const element of this.diasTurnos) {
          cuerpoPDF.descripcion+=`»${element.dia} : ${element.puntos}\n`;
        }
        break;
      case 'graficoLineaSolicitados':
        cuerpoPDF.descripcion += `Estadísticas de ${this.TurnosSolicitados[0].especialista}:\n`
        for await (const element of this.TurnosSolicitados) {
          cuerpoPDF.descripcion+=`»${element.dia} : ${element.puntos}\n`;
        }
        break;
      case 'graficoLineaFinalizados':
        cuerpoPDF.descripcion += `Estadísticas de ${this.TurnosFinalizados[0].especialista}:\n`
        for await (const element of this.TurnosFinalizados) {
          cuerpoPDF.descripcion+=`»${element.dia} : ${element.puntos}\n`;
        }
        break;
      case 'graficoPolar':
        cuerpoPDF.descripcion += `Estadísticas:\n`
        for await (const element of this.especialidades) {
          cuerpoPDF.descripcion+=`»${element.especilaidad} : ${element.puntos}\n`;
        }
        break;
    }

    return cuerpoPDF;
  }

  async generarCuerpoExcel(idCanvas:string){
    let datos : any[] = [];

    switch (idCanvas) {
      case 'graficoBarras':
        for await (const element of this.diasIngreso) {
          let data = {dia:element.dia, puntos:element.puntos}
          datos.push(data);
        }

        for await (const element of this.logIngreso) {
          let data = {usuario:element.usuario, fecha:element.dia, horario:element.horario}
          datos.push(data);          
        }
        break;
      case 'graficoLinea':
        for await (const element of this.diasTurnos) {
          let data = {dia:element.dia, puntos:element.puntos}
          datos.push(data);
        }
        break;
      case 'graficoLineaSolicitados':
        datos.push({especialista:this.TurnosSolicitados[0].especialista})
        for await (const element of this.TurnosSolicitados) {
          let data = {dia:element.dia, puntos:element.puntos}
          datos.push(data);
        }
        break;
      case 'graficoLineaFinalizados':
        datos.push({especialista:this.TurnosFinalizados[0].especialista})
        for await (const element of this.TurnosFinalizados) {
          let data = {dia:element.dia, puntos:element.puntos}
          datos.push(data);
        }
        break;
      case 'graficoPolar':
        for await (const element of this.especialidades) {
          let data = {dia:element.especilaidad, puntos:element.puntos}
          datos.push(data);
        }
        break;
    }

    return datos;
  }

  generatePDF(characterData: any) {
    console.log(characterData);
    const doc = new jsPDF();
    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();

    const marginX = 10;
    const marginY = 80; 
    const lineHeight = 10; 
  
    // Título
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text(characterData.titulo, 60, 30);
  
    // Imagen principal
    doc.addImage(characterData.imagen, 'PNG', 5, 0, 50, 50);
  
    // Línea divisoria
    doc.line(0, 60, docWidth, 60);
  
    // Descripción
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    const splitDescription = doc.splitTextToSize(characterData.descripcion, docWidth - 2 * marginX);
  
    let cursorY = marginY; 
  
    splitDescription.forEach((line:any) => {
      if (cursorY + lineHeight > docHeight - 20) {
        // Salto de página si el contenido excede la página actual
        doc.addPage();
        cursorY = 20; // Reinicia el cursor al margen superior de la nueva página
      }
      doc.text(line, marginX, cursorY);
      cursorY += lineHeight;
    });
  
    if (cursorY + 100 > docHeight - 20) {
      doc.addPage();
      cursorY = 20;
    }
    doc.addImage(characterData.grafico, 'PNG', marginX, cursorY, 180, 100);
  
    doc.save(`${characterData.titulo}.pdf`);
  }

  generateExcel(datos: any[], grafico: string, titulo: string) {
    // Crear el workbook y la hoja
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');
  
    // Si el array tiene objetos, generar encabezados dinámicamente
    if (datos.length > 0) {
      // Obtener todas las claves únicas de los objetos
      const keys = Array.from(
        new Set(datos.flatMap((item) => Object.keys(item))) // Combinar todas las claves
      );
  
      worksheet.addRow(keys); // Agregar encabezados
  
      // Agregar datos (valores de cada objeto)
      datos.forEach((item) => {
        const row = keys.map((key) => item[key] || ''); // Ordenar valores según las claves
        worksheet.addRow(row);
      });
  
      // Ajustar el ancho de las columnas automáticamente
      worksheet.columns = keys.map(() => ({ width: 25 }));
    }
  
    // Agregar la imagen
    if (grafico) {
      const imageId = workbook.addImage({
        base64: grafico, // La imagen debe estar en formato base64
        extension: 'png',
      });
  
      // Posicionar la imagen (debajo de los datos)
      const startRow = datos.length + 2; // Empieza después de las filas de datos
      const cantidadColumnas = worksheet.columnCount;

      worksheet.addImage(imageId, {
        tl: { col: cantidadColumnas+1, row: 0 }, // Coordenadas de la imagen
        ext: { width: 800, height: 500 }, // Tamaño de la imagen
      });
    }
  
    // Exportar el archivo
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `Log-${titulo}.xlsx`);
    });
  }
  
  
  //#endregion
}
