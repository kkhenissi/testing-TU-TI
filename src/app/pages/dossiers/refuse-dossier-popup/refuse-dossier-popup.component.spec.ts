import { RefuseDossierPopupComponent } from './refuse-dossier-popup.component';
import { TestBed, ComponentFixture, async, inject, fakeAsync, flush, getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatAutocompleteModule, MatDialogModule } from '@angular/material';
import { Component, OnInit, OnDestroy, Inject, ViewContainerRef, NgModule, ViewChild, Directive, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';
import { NgStyle } from '@angular/common';
import { MaterialModule } from './../../../theme/material/material.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslatePipe, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { NatureRefus, RefusDossier } from './refuse-dossier-popup.interface'
import { Dossier } from './../dossiers.interface';

import { DossierService } from './../dossiers.service';
import { AppService } from './../../../app.service';
import { MockBackend } from '@angular/http/testing';
import { XHRBackend } from '@angular/http';
import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpLoaderFactory } from 'app/app.module';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';

const translations: any = { 'TEST': 'This is a test' };
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(translations);
  }
}

const mockResponseNatureList: NatureRefus[] = [
  { 'id': 22, 'libelle': 'Dossier abandonné', 'code': 'NEXFF' },
  { 'id': 23, 'libelle': 'Dossier non éligible en 2018', 'code': 'ABAND' }
];

/**
 * Stub of DossierService
 * @see DossierService
 */
class DossierServiceStub {

  _dossierPhaseSubject = new Subject<boolean>();
  dossierPhase$ = this._dossierPhaseSubject.asObservable();

  dossier: Dossier = {
    id: 10,
    beneficiaire: { reference: '12455477P', raisonSociale: 'raison sociale de 12455477P', actif: true },
    thematique: null,
    departement: null,
    intitule: 'AABBCCDD',
    phase: '00',
    refusDossier: {
      id: 0,
      motifRefus: '',
      natureRefus: {
        id: 0,
        libelle: '',
        code: ''
      }
    },
    noOrdre: 1,
    noOrdreFormate: 'string',
    numeroDossier: 'string',
    referenceBenef: '',
    preDossier: null,
    responsableTechnique: null,
    numero_aid: null
  }

  isPhaseT40(): Boolean {
    return true;
  }
  getNatureRefus(): Observable<NatureRefus[]> {
    return Observable.of(mockResponseNatureList);
  }

  refuseDossier(dossierId: number, refusDossier: RefusDossier): Observable<Dossier> {
    return Observable.of(this.dossier);
  }
}

/**
 * Unit Test of RefuseDossierPopupComponent
 */
describe('Component: Refus dossier', () => {

  let component: RefuseDossierPopupComponent;
  let fixture: ComponentFixture<RefuseDossierPopupComponent>;

  let dialog: MatDialog;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<WithChildViewContainerComponent>;
  let mockLocation: SpyLocation;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule,
        DialogTestModule
      ],

      providers: [
        { provide: TranslateService, useValue: { translate: null } },
        {
          provide: MatDialogRef, useValue: {}
        },
        { provide: Location, useClass: SpyLocation },
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(RefuseDossierPopupComponent);

    // get test component from the fixture
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  beforeEach(
    inject([MatDialog, Location, OverlayContainer],
      (d: MatDialog, l: Location, oc: OverlayContainer) => {
        dialog = d;
        mockLocation = l as SpyLocation;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
      })
  );

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(WithChildViewContainerComponent);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  /**
   * component is well initialized
   */
  it('form invalid when empty', () => {
    expect(component.formRefus.valid).toBeFalsy();
  });

  /**
  * component is well initialized
  */
  it('motif field validity', () => {
    const form = component.formRefus;
    const motif = component.formRefus.controls['motif'];

    // Check that value is required
    let errors = motif.errors || {};
    expect(errors['required']).toBeTruthy();

    // Check that the field maxlength is exceeded
    // 80 characters instead of 240 max allowed
    const MotifInvalidValue = '01234567890123456789012345678901234567890123456789012345678901234567890123456' +
      '789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012' +
      '3456789012345678901234567890123456789012345678901234567890123456789M';
    form.get('motif').setValue(MotifInvalidValue);

    errors = motif.errors || {};
    expect(errors['maxlength']).toBeTruthy();

    // Check that the form is invalid
    expect(form.valid).toBeFalsy();
  });


  /**
  * nature is invalid when :
  *  - value is not provided (required)
  *  - value set is not one of the authorized ones
  */
  it('nature is invalid when not set or has an unauthorized value', () => {
    const form = component.formRefus;
    const nature = form.controls['nature'];

    // Check that a value is required
    let errors = nature.errors || {};
    expect(errors['required']).toBeTruthy();

    // Check that the value set is one of the authorized ones
    const natureRefus: NatureRefus = { 'id': 22, 'libelle': 'Dossier dosent exist in list', 'code': 'NEXFF' };

    form.get('nature').setValue(natureRefus);
    errors = nature.errors || {};
    expect(errors['natureNotFound']).toBeTruthy();

    // Check that the form is invalid
    expect(form.valid).toBeFalsy();
  });

  /**
   * form should be valid
   */
  it(`form should be valid`, async(() => {
    const motif = component.formRefus.controls['motif'];
    const nature = component.formRefus.controls['nature'];
    const natureRefus: NatureRefus = { 'id': 22, 'libelle': 'Dossier abandonné', 'code': 'NEXFF' };
    component.formRefus.get('motif').setValue('BOUCHON');
    component.formRefus.get('nature').setValue(natureRefus);
    expect(component.formRefus.valid).toBeTruthy();
  }));

  /**
  * should close a dialog and get back a result and return false
  */
  it('should close a dialog and get back a result and return false', fakeAsync(() => {
    const dialogRef = dialog.open(RefuseDossierPopupComponent);
    const afterCloseCallback = jasmine.createSpy('afterClose callback');
    component.dialogRef = dialogRef;
    component.dialogRef.afterClosed().subscribe(afterCloseCallback);
    component.onNoClick();
    viewContainerFixture.detectChanges();
    flush();
    expect(afterCloseCallback).toHaveBeenCalledWith(false);
    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  }));

  /**
  * should close a dialog and get back a result and return true
  */
  it('should close a dialog and get back a result and return true', fakeAsync(() => {
    const dialogRef = dialog.open(RefuseDossierPopupComponent);
    const afterCloseCallback = jasmine.createSpy('afterClose callback');
    component.dialogRef = dialogRef;
    component.dialogRef.afterClosed().subscribe(afterCloseCallback);
    component.onSubmit();
    viewContainerFixture.detectChanges();
    flush();
    expect(afterCloseCallback).toHaveBeenCalledWith(true);
    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  }));

});

// tslint:disable-next-line:directive-selector
@Directive({ selector: 'dir-with-view-container' })
class WithViewContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}


@Component({
  selector: 'siga-arbitrary-component',
  template: `<dir-with-view-container></dir-with-view-container>`,
})

export class WithChildViewContainerComponent {
  @ViewChild(WithViewContainerDirective) childWithViewContainer: WithViewContainerDirective;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

// Create a real (non-test) NgModule as a workaround for
const TEST_DIRECTIVES = [
  WithChildViewContainerComponent,
  WithViewContainerDirective,
  RefuseDossierPopupComponent
];

@NgModule({
  imports: [MatDialogModule, NoopAnimationsModule, TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient],
    }
  }),
    CommonModule,
    MatAutocompleteModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    HttpClientModule
  ],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    WithChildViewContainerComponent,
    RefuseDossierPopupComponent
  ],
})
class DialogTestModule { }
