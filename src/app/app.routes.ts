import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LoaderComponent } from './loader/loader.component';
import { SeccionUsuariosComponent } from './seccion-usuarios/seccion-usuarios.component';
import { authGuard } from './guards/auth.guard';
import { SolicitarTurnoComponent } from './solicitar-turno/solicitar-turno.component';
import { MiPerfilComponent } from './mi-perfil/mi-perfil.component';
import { TurnosComponent } from './turnos/turnos.component';
import { MisTurnosComponent } from './mis-turnos/mis-turnos.component';

export const routes: Routes = [
    {
        path: '', loadComponent: () =>
            import("./home/home.component").then(
                (c) => c.HomeComponent
            )
    },
    {
        path: 'login', component: LoginComponent,
        canActivate : [authGuard]
    },
    {
        path: 'register', component: RegisterComponent,
        canActivate : [authGuard]
    },
    {
        path: 'loader', component : LoaderComponent,
        canActivate : [authGuard]
    },
    {
        path: 'seccion-usuarios', component : SeccionUsuariosComponent,
        canActivate : [authGuard]
    },
    {
        path: 'solicitar-turno', component : SolicitarTurnoComponent,
        canActivate : [authGuard]
    },
    {
        path: 'mi-perfil', component : MiPerfilComponent,
        canActivate : [authGuard]
    },
    {
        path: 'turnos', component : TurnosComponent,
        canActivate : [authGuard]
    },
    {
        path: 'mis-turnos', component : MisTurnosComponent,
        canActivate : [authGuard]
    }
];
