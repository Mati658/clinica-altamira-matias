import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LoaderComponent } from './loader/loader.component';
import { SeccionUsuariosComponent } from './seccion-usuarios/seccion-usuarios.component';
import { authGuard } from './guards/auth.guard';

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
    }
];
