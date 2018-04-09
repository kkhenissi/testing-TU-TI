import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Ng2SmartTableModule } from 'ng2-smart-table';

import { routing } from './dossiers.routing';
import { NgaModule } from 'app/theme/nga.module';

import { AccueilComponent } from './accueil/accueil.component';
import { CreateDossierComponent } from './create-dossier/create-dossier.component';
import { DossierComponent } from './dossier/dossier.component';
import { RefuseDossierPopupComponent } from './refuse-dossier-popup/refuse-dossier-popup.component';
import { RechercheDossierComponent } from './recherche-dossier/recherche-dossier.component';
import { CritereCardComponent } from './recherche-dossier/criteres-card/criteres-card.component';

import { Test1Component } from './dossier/test1/test1.component';
import { Test2Component } from './dossier/test2/test2.component';

import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';

import { DossierService } from './dossiers.service';

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    Ng2SmartTableModule,
    routing,
    NgbModule.forRoot(),
  ],
  declarations: [
    AccueilComponent,
    CreateDossierComponent,
    DossierComponent,
    RefuseDossierPopupComponent,
    RechercheDossierComponent,
    CritereCardComponent,
    ConfirmPopupComponent,

    Test1Component,
    Test2Component
  ],
  entryComponents: [
    RefuseDossierPopupComponent,
    ConfirmPopupComponent,
  ],
  providers: [
    DossierService,
  ]
})
export class DossiersModule { }
