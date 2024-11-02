export class Administrador {
    nombre : string;
    apellido : string;
    edad : number;
    dni : number;
    mail : string;
    imagenes : any[];

    constructor(nombre:string, apellido:string, edad:number, dni:number, mail:string, imagenes:any[] = []){
        this.nombre = nombre;
        this.apellido = apellido ;
        this.edad =  edad;
        this.dni = dni;
        this.mail = mail;
        this.imagenes = imagenes;
    }
}
