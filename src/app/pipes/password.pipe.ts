import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'password',
  standalone: true
})
export class PasswordPipe implements PipeTransform {

  transform(value: string): string {
    if (value.length < 6) return 'Débil';
    if (/[A-Z]/.test(value) && /\d/.test(value)) return 'Fuerte';
    return 'Moderada';
  }

}
