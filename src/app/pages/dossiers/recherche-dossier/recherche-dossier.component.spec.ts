// Tests imports
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

// For asynchronous calls management
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

// Dependences imports
// Use of ngif, ngfor, ...
import { CommonModule } from '@angular/common';

// grid / layout / theme
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgaModule } from 'app/theme/nga.module';

// table
import { Ng2SmartTableModule } from 'ng2-smart-table';

// angular materials
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Declarations
import { RechercheDossierComponent } from './recherche-dossier.component';

// Services
import { DossierService } from './../dossiers.service';
import { AppService } from 'app/app.service';

// interfaces
import { Settings, Critere } from './recherche-dossier.interface';
import { Thematique, Departement, ResponsableTechnique } from '../create-dossier/create-dossier.interface';
import { Dossier } from '../dossiers.interface';

import { DossierServiceStub } from '../dossiers.service.spec';

/**
 * Unit Test of RechercheDossierComponent
 */
describe('Unit Test of RechercheDossierComponent', () => {
  let componentInstance: RechercheDossierComponent;
  let fixture: ComponentFixture<RechercheDossierComponent>;
  let dossierService: DossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        NgaModule.forRoot(),
        Ng2SmartTableModule,
        FlexLayoutModule,
        RouterTestingModule.withRoutes([{ path: 'pages/dossiers/update', component: RechercheDossierComponent }])
      ],
      declarations: [
        RechercheDossierComponent
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub }
      ]
    });

    fixture = TestBed.createComponent(RechercheDossierComponent);
    componentInstance = fixture.componentInstance;
    dossierService = fixture.debugElement.injector.get(DossierService);

  });

  /**
   * Component is well instanciated
   */
  it('should create', () => {
    fixture.detectChanges();
    expect(componentInstance).toBeTruthy();
  });

  /**
   * the component should initialise it\'s list of "thematique" and "depts" by using a service
   */
  it('the component should initialise it\'s list of "thematique", "responsableTechnique" and "depts" by using a service', () => {
    const spyGetThematiques = spyOn(dossierService, 'getThematiques').and.callThrough();
    const spyGetDepts = spyOn(dossierService, 'getDepts').and.callThrough();
    const spyGetResponsablesTech = spyOn(dossierService, 'getResponsableTech').and.callThrough();

    expect(spyGetThematiques.calls.any()).toBe(false, 'the service haven\'t been called yet');
    expect(spyGetDepts.calls.any()).toBe(false, 'the service haven\'t been called yet');
    expect(spyGetResponsablesTech.calls.any()).toBe(false, 'the service haven\'t been called yet');

    fixture.detectChanges();

    expect(spyGetThematiques.calls.count()).toBe(1, 'the service have been called');
    expect(spyGetDepts.calls.count()).toBe(1, 'the service have been called');
    expect(spyGetResponsablesTech.calls.count()).toBe(1, 'the service have been called');
  });

  /**
 * #loadDataSource have to load datas by calling load method of our LocalDataSource
 */
  it('#loadDataSource have to load datas by calling load method of our LocalDataSource', () => {
    fixture.detectChanges();
    componentInstance.dossiersDatas = [];
    const spyLoadLocalDataSource = spyOn(componentInstance.source, 'load').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');

    componentInstance.loadDataSource();

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'load should have been triggered when #loadDataSource is called');
  });

  /**
* #fetchResultatRecherche use the service to get the datas to display + calls the localDataSource methode
*/
  it('#fetchResultatRecherche use the service to get the datas to display + calls the localDataSource methode', () => {
    fixture.detectChanges();

    const dummyCriteres = {
      thematique: '1',
      departement: null,
      numeroIncrement: null,
      responsableTechnique: null,
      codeBenef: null,
      pageAAficher: null,
      nbElemPerPage: null
    };

    const spyLoadLocalDataSource = spyOn(componentInstance, 'loadDataSource').and.callThrough();
    const spyGetResultatRecherche = spyOn(dossierService, 'getResultatRecherche').and.callThrough();

    expect(spyLoadLocalDataSource.calls.any()).toBe(false, 'loadDataSource not yet called');
    expect(spyGetResultatRecherche.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.fetchResultatRecherche(dummyCriteres);

    expect(spyLoadLocalDataSource.calls.any()).toBe(true, 'loadDataSource should have been called durring #fetchResultatRecherche');
    expect(spyGetResultatRecherche.calls.any()).toBe(true, 'the service have been called');
    expect(componentInstance.dossiersDatas).toBeTruthy();
  });

  /**
* #onDossierSelect should set the var dossier in the service + navigate to the proper view
*/
  xit('#onDossierSelect should set the var dossier in the service + navigate to the proper view', () => {
    fixture.detectChanges();

    const spyNavigate = spyOn(componentInstance.router, 'navigate');

    const dummyFolder: Dossier = {
      id: 1,
      departement: '09',
      thematique: {
        id: 1,
        codeParam: 'THEMA',
        libelleParam: null,
        code: 'AGRI',
        libelle: 'Agriculture'
      },
      intitule: 'zaeazeaze',
      beneficiaire: { reference: '12455477P', raisonSociale: 'raison sociale de 12455477P', actif: true },
      responsableTechnique: {
        login: 'monLogin2',
        prenom: 'prenom2',
        nom: 'syre'
      },
      noOrdre: 1,
      phase: null,
      refusDossier: null,
      dateDemande: null,
      origineDemande: null,
      noOrdreFormate: '00001',
      numeroDossier: 'AGRI-09-00001',
      referenceBenef: '12455477P',
      preDossier: null,
      numero_aid: null
    }

    // expect(dossierService.currentDossierId).toBeUndefined();
    // componentInstance.displayFolder({ 'data': dummyFolder });
    // expect(dossierService.currentDossierId).toBeDefined();
    // expect(dossierService.currentDossierId).toEqual(dummyFolder.id);
    expect(spyNavigate).toHaveBeenCalledWith(['/pages/dossiers/update']);
  });

});
