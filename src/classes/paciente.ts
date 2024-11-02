export class Paciente {
    nombre : string;
    apellido : string;
    edad : number;
    dni : number;
    mail : string;
    imagenes : any[];
    obraSocial : string;

    constructor(nombre:string, apellido:string, edad:number, dni:number, obraSocial:string, mail:string, imagenes:any[] = []){
        this.nombre = nombre;
        this.apellido = apellido ;
        this.edad =  edad;
        this.dni = dni;
        this.obraSocial = obraSocial ;
        this.mail = mail;
        this.imagenes = imagenes;
    }

}
