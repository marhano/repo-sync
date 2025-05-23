import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideMarkdown } from 'ngx-markdown';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    environment.production
    ? provideRouter(routes, withComponentInputBinding(), withHashLocation())
    : provideRouter(routes, withComponentInputBinding(), withHashLocation()), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideMarkdown()
  ]
};
