import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  let auth = inject(AuthService);
  let flag : boolean = false;

  flag = false;
  if (!auth.logeado) {
    if (state.url == '/login' || state.url == '/register') {
      return true;
    }
  }
  if (state.url == '/login' || state.url == '/register') {
    return false;
  }
  if (state.url == '/seccion-usuarios' && auth.perfil == 'Administrador') {
    return true;
  }
  if (state.url == '/turnos' && auth.perfil == 'Administrador') {
    return true;
  }
  if (state.url == '/solicitar-turno' && (auth.perfil == 'Administrador' || auth.perfil == 'Paciente')) {
    return true
  }
  if (state.url == '/mi-perfil' && (auth.perfil == 'Especialista' || auth.perfil == 'Paciente')) {
    return true
  }
  if (state.url == '/mis-turnos' && (auth.perfil == 'Especialista' || auth.perfil == 'Paciente')) {
    return true
  }
  if (state.url == '/seccion-pacientes' && auth.perfil == 'Especialista') {
    return true
  }
  return flag;
};
