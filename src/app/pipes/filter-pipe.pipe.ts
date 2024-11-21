import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Pipe({
  name: 'filterPipe',
  standalone: true
})
export class FilterPipePipe implements PipeTransform {

  auth = inject(AuthService);

  transform(items: any[], filtrar: string): any[] {
    console.log(filtrar)
    if (!items) return [];
    if (!filtrar) return items;

    const terms1 = filtrar ? filtrar.toLowerCase().split(' ') : [];

    return items.filter(item => {
      const match1 = terms1.some(term => item.especialidad.toLowerCase().includes(term));
      let match7 : boolean = false;
      let match2;
      let match3;
      if (this.auth.perfil == 'Especialista'){
        match2 = terms1.some(term => item.paciente.nombre.toLowerCase().includes(term));
        match3 = terms1.some(term => item.paciente.apellido.toLowerCase().includes(term));
      }
      else if(this.auth.perfil == 'Paciente'){
        match2 = terms1.some(term => item.especialista.nombre.toLowerCase().includes(term));
        match3 = terms1.some(term => item.especialista.apellido.toLowerCase().includes(term));
      }else{
        match2 = terms1.some(term => item.paciente.nombre.toLowerCase().includes(term));
        match3 = terms1.some(term => item.especialista.nombre.toLowerCase().includes(term));
      }

      const match4 = terms1.some(term => item.dia.toLowerCase().includes(term));
      const match5 = terms1.some(term => item.hora.toLowerCase().includes(term));
      const match6 = terms1.some(term => item.estado.toLowerCase().includes(term));

      //historial clinico
      if (item.historial) {
        console.log(Object.values(item.historial))
        match7 = terms1.some(term => String(Object.values(item.historial)).toLowerCase().includes(term));
        
      }

      return (match1) || (match2 || match3) || match4 || match5 || match6 || match7 ;
    });
  }

}
