import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Paciente } from '../../classes/paciente';
import { Especialista } from '../../classes/especialista';
import { Observable } from 'rxjs';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { collection, doc, getDoc, getDocs, getFirestore, increment, query, updateDoc, where } from '@angular/fire/firestore';
import { Administrador } from '../../classes/administrador';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private firestore = inject(AngularFirestore);
  private storage = inject(Storage);
  pacientes : Paciente[] = [];
  especialistas : Especialista[] = [];

  constructor() { }

  agregarUsuario(user : Paciente | Especialista | Administrador, imagenes:Blob[], tipoUsuario:string){
    let arrayUrls : string[] = []
    imagenes.forEach(imagen => {
      const storageRef = ref(this.storage, `${tipoUsuario}s/` + Date.now());
      uploadBytes(storageRef, imagen).then(()=>{
        getDownloadURL(storageRef).then(url=>{
          arrayUrls.push(url);
          console.log(arrayUrls);
        });
      });
    });
    setTimeout(() => {
      user.imagenes = arrayUrls;
      console.log(tipoUsuario);
      let plural = tipoUsuario == 'administrador' ? "es" : "s";
      const colUsuarios = this.firestore.collection(tipoUsuario + plural); //referencia a la coleccion de BD
      console.log(user);
      colUsuarios.add({...user, tipoUsuario});
    }, 2000);
  }

  traerUsuarios(coleccion:string): Observable<Paciente[] | Especialista[] | Administrador[]> {
    const colUsuarios = this.firestore.collection(coleccion);
    return colUsuarios.valueChanges({ idField: 'id' }) as Observable<any[]>;
  }

  async agregarEspecializacion(element:string){
    const docRef = doc(getFirestore(), "especializaciones", "H3jCwaWuWk4lazYvOZoI");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data : any = docSnap.data();
      if (data.especialidadesMedicas) {
        if (!data.especialidadesMedicas.includes(element)) {
          const nuevaEspecializacion = [...data.especialidadesMedicas, element];
          
          return updateDoc(docRef, {
            especialidadesMedicas: nuevaEspecializacion
          });
        }
      }
    }
  }

  agregarColeccion(path:string, data:any){
    const col = this.firestore.collection(path); //referencia a la coleccion de BD
    console.log(data);
    col.add({...data});
  }

  traerEspecializaciones(): Observable<string[]> {
    const colUsuarios = this.firestore.collection("especializaciones");
    return colUsuarios.valueChanges() as Observable<string[]>;
  }

  actualizarEstadoTurno(id:string, estado:string){
    return this.firestore.collection('turnos').doc(id).update({estado: estado});
  }

  actualizarMensajeTurno(id:string, mensaje:string){
    return this.firestore.collection('turnos').doc(id).update({mensaje: mensaje});
  }

  actualizarCalificacionTurno(id:string, mensaje:string){
    return this.firestore.collection('turnos').doc(id).update({calificacion: mensaje});
  }

  actualizarExpTurno(id:string, puntos:number){
    return this.firestore.collection('turnos').doc(id).update({exp: puntos});
  }

  actualizarEspecialista(id:string, aprobacion:boolean){
    return this.firestore.collection('especialistas').doc(id).update({aprobado: aprobacion});
  }

  actualizarHistorialTurno(id:string, historial:any){
    return this.firestore.collection('turnos').doc(id).update({historial: historial});
  }

  async actualizarTurnos(id:string, path:string, horario:string){
    const docRef = doc(getFirestore(), path, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data : any = docSnap.data();
      if (data.turnos) {
        if (!data.turnos.includes(horario)) {
          const nuevosHorarios = [...data.turnos, horario];
          
          return updateDoc(docRef, {
            turnos: nuevosHorarios
          });
        }
        return;
      }
      const nuevosHorarios = [horario];
      return updateDoc(docRef, {
        turnos: nuevosHorarios
      });
    }
  }

  async actualizarEspecialistaPacientes(id:string, path:string, especialista:string){
    const docRef = doc(getFirestore(), path, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data : any = docSnap.data();
      if (data.atendidoPor) {
        if (!data.atendidoPor.includes(especialista)) {
          const nuevosMedicos = [...data.atendidoPor, especialista];
          
          return updateDoc(docRef, {
            atendidoPor: nuevosMedicos
          });
        }
        return;
      }
      const nuevosMedicos = [especialista];
      return updateDoc(docRef, {
        atendidoPor: nuevosMedicos
      });
    }
  }



  async actualizarHorarios(id:string, path:string, horario:any[]){
    const docRef = doc(getFirestore(), path, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      let nuevosHorarios : any[] = []
      for await (const element of horario) {
        nuevosHorarios.push(element);
      }
      console.log(nuevosHorarios);
      return updateDoc(docRef, {
        horariosDisponibles: nuevosHorarios
      });
    }
  }

  obtenerDocPorId(path:string, id:string){
    return this.firestore.collection(path).doc(id).get();
  }

  // async actualizarSinID(path: string, campo: string, valor: string, horario: string){
  //   const db = getFirestore();
  //   const coleccionRef = collection(db, path);

  //   // Busca el documento por el campo específico
  //   const q = query(coleccionRef, where(campo, "==", valor));
  //   const querySnapshot = await getDocs(q);

  //   if (!querySnapshot.empty) {
  //     querySnapshot.forEach(async (docSnap) => {
  //       const data: any = docSnap.data();
        
  //       if (data.turnos) {
  //         if (!data.turnos.includes(horario)) {
  //           const nuevosHorarios = [...data.turnos, horario];

  //           // Actualizar el documento encontrado
  //           await updateDoc(docSnap.ref, {
  //             turnos: nuevosHorarios,
  //           });
  //         }
  //       } else {
  //         const nuevosHorarios = [horario];
  //         await updateDoc(docSnap.ref, {
  //           turnos: nuevosHorarios,
  //         });
  //       }
  //     });
  //   } else {
  //     console.log("No se encontró ningún documento con ese valor.");
  //   }
  // }
}
