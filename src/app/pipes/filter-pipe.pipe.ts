import { inject, Pipe, PipeTransform } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Pipe({
  name: 'filterPipe',
  standalone: true
})
export class FilterPipePipe implements PipeTransform {

  auth = inject(AuthService);

  transform(items: any[], especialidad: string, usuario : string): any[] {
    if (!items) return [];
    if (!especialidad && !usuario) return items;

    const terms1 = especialidad ? especialidad.toLowerCase().split(' ') : [];
    const terms2 = usuario ? usuario.toLowerCase().split(' ') : [];

    return items.filter(item => {
      console.log(item.especialidad)
      const match1 = terms1.some(term => item.especialidad.toLowerCase().includes(term));

      let match2;
      let match3;
      if (this.auth.perfil == 'Especialista'){
        match2 = terms2.some(term => item.paciente.nombre.toLowerCase().includes(term));
        match3 = terms2.some(term => item.paciente.apellido.toLowerCase().includes(term));
      }
      else{
        match2 = terms2.some(term => item.especialista.nombre.toLowerCase().includes(term));
        match3 = terms2.some(term => item.especialista.apellido.toLowerCase().includes(term));
      }
      

       
      // Puedes personalizar aquí si quieres que ambos filtros se cumplan (&&) o solo uno de ellos (||)
      return (match1) || (match2 || match3);
    });
  }

}
