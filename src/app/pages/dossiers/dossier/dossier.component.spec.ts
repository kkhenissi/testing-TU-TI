// import { TestBed, ComponentFixture, async } from '@angular/core/testing';
// import { Component, DebugElement } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
// import { startWith } from 'rxjs/operators/startWith';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/observable/of';
// import { By } from '@angular/platform-browser';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormsModule } from '@angular/forms';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { FlexLayoutModule } from '@angular/flex-layout';
// import { RouterTestingModule } from '@angular/router/testing';

// import { MaterialModule } from 'app/theme/material/material.module';

// import { DossierComponent } from './dossier.component';

// import { Dossier } from './../dossiers.interface';
// import { DossierCreate, Thematique, Departement, Beneficiaire, ResponsableTechnique } from '../create-dossier/create-dossier.interface'

// import { DossierService } from './../dossiers.service';
// import { Subject } from 'rxjs/Subject';
// import { MatDialogRef, MatDialogModule, DateAdapter, MatDatepicker, MatNativeDateModule, MatAutocompleteModule } from '@angular/material';
// import { MatMomentDateModule } from '@angular/material-moment-adapter';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { HttpClientModule } from '@angular/common/http';

// /**
//  * Stub of DossierService
//  * @see DossierService
//  */
// class UpdateDossierServiceStub {
//   _dossier: Dossier = null;
//   _dossierPhaseSubject = new Subject<boolean>();
//   dossierPhase$ = this._dossierPhaseSubject.asObservable();

//   isPhaseT40(): void {

//     if (this._dossier && this._dossier.phase === 'T40') {
//       return this._dossierPhaseSubject.next(true);
//     }
//     return this._dossierPhaseSubject.next(false);
//   }

//   createDossier(dossier: DossierCreate): Observable<Dossier> {
//     const dossierCree: Dossier = {
//       beneficiaire: dossier.beneficiaire,
//       thematique: dossier.thematique,
//       departement: dossier.departement,
//       intitule: dossier.intitule,
//       id: 1,
//       noOrdre: 1,
//       noOrdreFormate: '00001',
//       numeroDossier: 'GREE-09-00001',
//       phase: null,
//       refusDossier: null,
//       referenceBenef: 'reference',
//       preDossier: null,
//       responsableTechnique: null
//     };
//     return Observable.of(dossierCree);
//   }

//   getBeneficaire(reference: string): Observable<Beneficiaire> {
//     const beneficiaire: Beneficiaire = {
//       actif: true,
//       reference: '01234567M',
//       raisonSociale: 'raison sociale de 01234567M'
//     };
//     return Observable.of(beneficiaire);
//   }
//   getDossier(idDossier: number): Observable<Dossier> {
//     const dossierCree: Dossier = {
//       id: 1,
//       thematique: null,
//       departement: null,
//       intitule: 'test',
//       beneficiaire: { reference: '12455477P', raisonSociale: 'raison sociale de 12455477P', actif: true },
//       noOrdre: 1,
//       phase: null,
//       refusDossier: null,
//       dateDemande: null,
//       origineDemande: null,
//       noOrdreFormate: '00001',
//       numeroDossier: 'AGRI-31-00001',
//       referenceBenef: '12455477P',
//       preDossier: null,
//       responsableTechnique: null
//     };
//     return Observable.of(dossierCree);
//   }

//   updateDossier(dossier: Dossier): Observable<Dossier> {
//     const dossierUpdate: Dossier = {
//       id: 1,
//       thematique: null,
//       departement: null,
//       intitule: 'test',
//       beneficiaire: { reference: '12455477P', raisonSociale: 'raison sociale de 12455477P', actif: true },
//       noOrdre: 1,
//       phase: null,
//       refusDossier: null,
//       dateDemande: null,
//       origineDemande: null,
//       noOrdreFormate: '00001',
//       numeroDossier: 'AGRI-31-00001',
//       referenceBenef: '12455477P',
//       preDossier: null,
//       responsableTechnique: null
//     };
//     return Observable.of(dossierUpdate);
//   }


// }


// /**
//  * Unit Test of DossierComponent
//  */
// xdescribe('Unit Test of DossierComponent', () => {
//   let componentInstance: DossierComponent;
//   let fixture: ComponentFixture<DossierComponent>;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         CommonModule,
//         BrowserAnimationsModule,
//         ReactiveFormsModule,
//         MaterialModule,
//         FlexLayoutModule,
//         RouterTestingModule,
//         MaterialModule,
//       ],
//       declarations: [
//         DossierComponent
//       ],
//       providers: [
//         { provide: DossierService, useClass: UpdateDossierServiceStub }, {
//           provide: MatDialogRef, useValue: {}
//         }
//       ]
//     });

//     fixture = TestBed.createComponent(DossierComponent);
//     componentInstance = fixture.componentInstance;
//     fixture.detectChanges();
//   });


//   /**
//    * Component is well instanciated
//    */
//   fit('Should create', () => {
//     expect(componentInstance).toBeTruthy();
//   });


//   /**
//    * Form invalid when empty
//    */
//   xit('Form invalid when empty', () => {
//     expect(componentInstance.formUpdateDossier.valid).toBeFalsy();
//   });


// });
