import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  let auth = inject(AuthService);
  let flag : boolean = false;

  flag = auth.logeado;
  console.log(auth.auth.currentUser)
  if (!flag) {
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
  return flag;
};
