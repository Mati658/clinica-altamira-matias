import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import localeEs from '@angular/common/locales/es';

import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaComponent, RecaptchaSettings } from 'ng-recaptcha';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp(environment.firebaseConfig)
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideHttpClient(withFetch()),
    { provide : FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    [{ provide: LOCALE_ID, useValue: 'es' }],
    importProvidersFrom(RecaptchaComponent), // Importa RecaptchaFormsModule aquí
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6LcpoXcqAAAAAIfQ5YvZE7bLvlC_rnx9Upkh1S8b',
      } as RecaptchaSettings,
    },
    provideAnimations()
  ],
};
