import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccueilComponent } from './accueil/accueil.component';
import { CreateDossierComponent } from './create-dossier/create-dossier.component';
import { DossierComponent } from './dossier/dossier.component';
import { RechercheDossierComponent } from './recherche-dossier/recherche-dossier.component';

import { Test1Component } from './dossier/test1/test1.component';
import { Test2Component } from './dossier/test2/test2.component';

import {
  CanDeactivateGuardCreateDossier,
  CanDeactivateGuardDossier,
} from 'app/core/injectables/can-deactivate-guard.service';
import { IsBackendConfigReady } from 'app/core/injectables/can-activate-guard.service';

export const routes: Routes = [
  {
    path: '',
    canActivate: [IsBackendConfigReady],
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { path: 'accueil', component: AccueilComponent },
      {
        path: 'creation',
        component: CreateDossierComponent,
        canDeactivate: [CanDeactivateGuardCreateDossier]
      },
      {
        path: 'dossier/:dossierId',
        component: DossierComponent,
        canDeactivate: [CanDeactivateGuardDossier],
        // children: [
        //   {
        //     path: '',
        //     redirectTo: 'preDossier',
        //     outlet: 'dossier',
        //     pathMatch: 'full'
        //   },
        //   {
        //     path: 'preDossier',
        //     outlet: 'dossier',
        //     component: Test1Component,
        //     // canDeactivate: [TEST]
        //   },
        //   {
        //     path: 'infoSpec',
        //     outlet: 'dossier',
        //     component: Test2Component,
        //   },
        //   {
        //     path: '',
        //     redirectTo: 'montants',
        //     outlet: 'nature',
        //     pathMatch: 'full'
        //   },
        //   {
        //     path: 'montants',
        //     outlet: 'nature',
        //     component: Test2Component,
        //   },
        //   {
        //     path: 'caracteristiques',
        //     outlet: 'nature',
        //     component: Test1Component,
        //   },
        // ]
      },
      {
        path: 'recherche',
        component: RechercheDossierComponent
      },
    ]
  },
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
