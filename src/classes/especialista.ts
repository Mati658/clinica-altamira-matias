export class Especialista {
    nombre : string;
    apellido : string;
    edad : number;
    dni : number;
    mail : string;
    imagenes : any[];
    especializaciones : string[];
    aprobado : boolean;
    constructor(nombre:string, apellido:string, edad:number, dni:number, especializacion:string[], mail:string, imagenes:any[] = [], aprobado:boolean = false){
        this.nombre = nombre;
        this.apellido = apellido ;
        this.edad =  edad;
        this.dni = dni;
        this.especializaciones = especializacion ;
        this.mail = mail;
        this.imagenes = imagenes;
        this.aprobado = aprobado;
    }
}
