import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Paciente } from '../../classes/paciente';
import { Especialista } from '../../classes/especialista';
import { Observable } from 'rxjs';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { doc, getDoc, getFirestore, updateDoc } from '@angular/fire/firestore';
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

  traerEspecializaciones(): Observable<string[]> {
    const colUsuarios = this.firestore.collection("especializaciones");
    return colUsuarios.valueChanges() as Observable<string[]>;
  }


  actualizarEspecialista(id:string, aprobacion:boolean){
    return this.firestore.collection('especialistas').doc(id).update({aprobado: aprobacion});
  }
}
