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
import { CargaHistorialComponent } from './carga-historial/carga-historial.component';
import { SeccionPacientesComponent } from './seccion-pacientes/seccion-pacientes.component';
import { animation } from '@angular/animations';

export const routes: Routes = [
    {
        path: '', loadComponent: () =>
            import("./home/home.component").then(
                (c) => c.HomeComponent
            ),
            data : {animation: 'a'}
        },
    {
        path: 'login', component: LoginComponent,
        canActivate : [authGuard],
        data : {animation: 'b'}

    },
    {
        path: 'register', component: RegisterComponent,
        canActivate : [authGuard],
        data : {animation: 'c'}


    },
    {
        path: 'loader', component : LoaderComponent,
        canActivate : [authGuard],
        // data : {animation: 'Page'}


    },
    {
        path: 'seccion-usuarios', component : SeccionUsuariosComponent,
        canActivate : [authGuard],
        data : {animation: 'e'}


    },
    {
        path: 'solicitar-turno', component : SolicitarTurnoComponent,
        canActivate : [authGuard],
        data : {animation: 'f'}


    },
    {
        path: 'mi-perfil', component : MiPerfilComponent,
        canActivate : [authGuard],
        data : {animation: 'g'}


    },
    {
        path: 'turnos', component : TurnosComponent,
        canActivate : [authGuard],
        data : {animation: 'h'}


    },
    {
        path: 'mis-turnos', component : MisTurnosComponent,
        canActivate : [authGuard],
        data : {animation: 'i'}

    },
    {
        path: 'seccion-pacientes', component : SeccionPacientesComponent,
        canActivate : [authGuard],
        data : {animation: 'j'}

    }
];
