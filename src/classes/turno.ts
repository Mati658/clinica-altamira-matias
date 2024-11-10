export class Turno {
    hora : string;
    dia : string;
    paciente : any;
    especialista : any;
    especialidad : any;
    estado : string;
    mensaje : string;
    reseña : string;

    constructor(hora : string, dia : string, paciente : any, especialista : any, especialidad : string){
        this.hora = hora;
        this.dia = dia;
        this.paciente = paciente;
        this.especialista = especialista;
        this.especialidad = especialidad;
        this.estado = 'Espera';
        this.mensaje = "";
        this.reseña = "";
    }
}
