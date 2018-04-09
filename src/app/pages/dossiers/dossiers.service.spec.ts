import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';

import { Critere } from './recherche-dossier/recherche-dossier.interface';
import { Dossier } from './dossiers.interface';

import { DossierUpdate, OrigineDemande, NiveauPriorite, SessionDecision } from './dossier/dossier.interface';
import { NatureRefus, RefusDossier } from './refuse-dossier-popup/refuse-dossier-popup.interface';
import { Beneficiaire, Departement, DossierCreate, ResponsableTechnique, Thematique } from './create-dossier/create-dossier.interface';

import { DossierService } from './dossiers.service';
import { AppService } from 'app/app.service';
import { AppServiceStub } from 'app/app.service.spec';
import { GlobalState } from 'app/global.state';

/**
 * Stub of DossierService
 */
export class DossierServiceStub {
  getThematiques(): Observable<Thematique[]> {
    const thematiques: Thematique[] = [
      { id: 1, code: 'AGRI', libelle: 'Agriculture', },
      { id: 2, code: 'GREE', libelle: 'Gestion de la Ressource et Economie d\'Eau' }
    ];
    return Observable.of(thematiques);
  }

  getDepts(): Observable<Departement[]> {
    const depts: Departement[] = [
      { id: '09', code: '', libelle: 'Ariège' },
      { id: '12', code: '', libelle: 'Aveyron' }
    ];
    return Observable.of(depts);
  }

  getBeneficaire(reference: string): Observable<Beneficiaire> {
    const beneficiaire: Beneficiaire = {
      actif: true,
      reference: '01234567M',
      raisonSociale: 'raison sociale de 01234567M'
    };
    return Observable.of(beneficiaire);
  }

  getResponsableTech(): Observable<ResponsableTechnique[]> {
    const respnTechs: ResponsableTechnique[] = [
      { login: 'cccc', prenom: 'philippe', nom: 'redon' },
      { login: 'aaaa', prenom: 'alex', nom: 'alex_nom' },
      { login: 'bbbb', prenom: 'rombo', nom: 'rombo_nom' },
      { login: '12', prenom: 'Aveyron', nom: 'Aveyron' },
      { login: '09', prenom: 'Ariège', nom: 'nom' }
    ];
    return Observable.of(respnTechs);
  }

  createDossier(dossier: DossierCreate): Observable<Dossier> {
    const dossierCree: Dossier = {
      beneficiaire: dossier.beneficiaire,
      thematique: dossier.thematique,
      departement: dossier.departement,
      intitule: dossier.intitule,
      id: 1,
      noOrdre: 1,
      noOrdreFormate: '00001',
      numeroDossier: 'GREE-09-00001',
      phase: null,
      refusDossier: null,
      referenceBenef: 'reference',
      preDossier: null,
      responsableTechnique: dossier.responsableTechnique,
      numero_aid: null
    };
    return Observable.of(dossierCree);
  }

  getResultatRecherche(criteresRecherche: Critere): Observable<any> {
    const resultatRecherche = {
      nombreTotalElements: 19,
      nombreTotalPages: 2,
      numeroPageCourante: 0,
      nombreElementsPageCourante: 15,
      nombreElementsParPage: 15,
      hasNext: true,
      hasPrevious: false,
      dossiers: [
        {
          id: 1,
          departement: '31',
          thematique: {
            id: 1,
            codeParam: 'THEMA',
            libelleParam: null,
            code: 'AGRI',
            libelle: 'Agriculture'
          },
          intitule: 'test',
          beneficiaire: { reference: '12455477P', raisonSociale: 'raison sociale de 12455477P', actif: true },
          responsableTechnique: {
            login: 'monLogin1',
            prenom: 'prenom1',
            nom: 'diop'
          },
          noOrdre: 1,
          phase: null,
          refusDossier: null,
          dateDemande: null,
          origineDemande: null,
          noOrdreFormate: '00001',
          numeroDossier: 'AGRI-31-00001'
        }, {
          id: 2,
          departement: '31',
          thematique: {
            id: 1,
            codeParam: 'THEMA',
            libelleParam: null,
            code: 'AGRI',
            libelle: 'Agriculture'
          },
          intitule: 'test',
          beneficiaire: { reference: '12455477P', raisonSociale: 'raison sociale de 12455477P', actif: true },
          responsableTechnique: {
            login: 'monLogin2',
            prenom: 'prenom2',
            nom: 'syre'
          },
          noOrdre: 2,
          phase: null,
          refusDossier: null,
          dateDemande: null,
          origineDemande: null,
          noOrdreFormate: '00002',
          numeroDossier: 'AGRI-31-00002'
        }],
      premierePage: true,
      dernierePage: false
    };
    return Observable.of(resultatRecherche);
  }
}

/**
 * Unit Test of DossierService
 */
describe('DossierService unit test', () => {
  let injector: TestBed;
  let appService: AppService;
  let dossierService: DossierService;
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DossierService,
        GlobalState,
        {
          provide: AppService, useClass: AppServiceStub
        }
      ]
    });

    injector = getTestBed();

    appService = injector.get(AppService);
    dossierService = injector.get(DossierService);
    httpClient = injector.get(HttpClient);
    httpMock = injector.get(HttpTestingController);
  });

  /**
 * getThematiques should return an array of thematics
 */
  it('getThematiques should return an Observable<Object> which contain an array of thematics', () => {
    // initialisation d'un resultat type que le backend fournirait
    const dummyThematiques = [
      {
        id: 1,
        codeParam: 'THEMA',
        libelleParam: null,
        code: 'AGRI',
        libelle: 'Agriculture'
      }, {
        id: 2,
        codeParam: 'THEMA',
        libelleParam: null,
        code: 'GREE',
        libelle: 'Gestion de la Resssource et Economie d\'Eau'
      }
    ];

    dossierService.getThematiques().subscribe(data => {
      // test des différents éléments du retour
      expect(data[0].id).toBe(1)
      expect(data).toEqual(dummyThematiques, '#getResultatRecherche\'s method should return the proper object');
    });


    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + '/valeur/thematique');
    expect(req.request.method).toBe('GET');
    req.flush(dummyThematiques);
  });

  it('#getResponsableTech should return an Observable<Object> which contain an array of responsables technique', () => {
    // initialisation d'un resultat type que le backend fournirait

    const dummyResponsablesTech = [
      {
        'login': 'monLogin1',
        'prenom': 'prenom1',
        'nom': 'diop'
      }, {
        'login': 'monLogin2',
        'prenom': 'prenom2',
        'nom': 'Syre'
      }
    ];

    dossierService.getResponsableTech().subscribe(data => {
      // test des différents éléments du retour
      expect(data[0].login).toBe('monLogin1')
      expect(data).toEqual(dummyResponsablesTech, '#getResultatRecherche\'s method should return the proper object');
    });


    // configuration de la réponse mockée
    const req = httpMock.expectOne(appService.environment.BACKEND + '/utilisateur');
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponsablesTech);
  });

  it('#createDossier should send a post request and return an Observable<Object> which contain the datas of the created "dossier" ', () => {
    // initialisation d'un bénéficaires rattaché au dossier
    const beneficiaire: Beneficiaire = {
      actif: true,
      reference: '01234567M',
      raisonSociale: 'raison sociale de '
    };
    // initialization of dossier
    const dummyDossier = {
      beneficiaire: beneficiaire,
      departement: '31',
      intitule: 'test création dossier',
      thematique: {
        id: 1,
        codeParam: 'THEMA',
        libelleParam: null,
        code: 'AGRI',
        libelle: 'Agriculture'
      },
      responsableTechnique: {
        login: 'test',
        prenom: 'prenom dd',
        nom: 'mon nom'
      }
    }

    // initialization of result of createDossier
    const dummyResponseCreerDossier = {
      id: 4,
      departement: '31',
      thematique: {
        id: 1,
        codeParam: 'THEMA',
        libelleParam: null,
        code: 'AGRI',
        libelle: 'Agriculture'
      },
      intitule: 'test creation dossier',
      beneficiaire: beneficiaire,
      noOrdre: 4,
      phase: null,
      refusDossier: null,
      dateDemande: null,
      origineDemande: null,
      noOrdreFormate: '00004',
      numeroDossier: 'AGRI-31-00004',
      numeroRaisonSocialeBeneficiare: '77777777Z-BOUCHON',
      responsableTechnique: {
        login: 'test',
        prenom: 'prenom dd',
        nom: 'mon nom'
      }
    }


    dossierService.createDossier(dummyDossier).subscribe(data => {
      // test des différents éléments du retour
      expect(data.id).toBe(4);
      expect(data.departement).toBe('31');
      expect(data.thematique).toEqual({
        id: 1,
        codeParam: 'THEMA',
        libelleParam: null,
        code: 'AGRI',
        libelle: 'Agriculture'
      });
      expect(data.responsableTechnique).toEqual({
        'login': 'test',
        'prenom': 'prenom dd',
        'nom': 'mon nom'
      });
      expect(data.intitule).toBe('test creation dossier');
      expect(data.beneficiaire).toBe(beneficiaire);
      expect(data.noOrdre).toBe(4);
      expect(data.phase).toBe(null);
      expect(data.refusDossier).toBe(null);
      expect(data.noOrdreFormate).toBe('00004');
      expect(data.numeroDossier).toBe('AGRI-31-00004',
        '#createDossier\'s method should return the proper object');
    });

    // configuration of mocked response
    const req = httpMock.expectOne(appService.environment.BACKEND + '/dossier');
    expect(req.request.method).toBe('POST');
    req.flush(dummyResponseCreerDossier);
  });

  /**
 * unit test of getResultatRecherche function
 */
  it('getResultatRecherche should return an Observable<Object> with the needed informations for the result s table', () => {

    // initialization of cretaria object
    const dummyConfigCard: Critere = {
      thematique: '1',
      departement: null,
      responsableTech: null,
      numeroIncrement: null,
      codeBenef: null,
      pageAAficher: null,
      nbElemPerPage: 15
    }

    // initialization of result type from backend
    const dummySearchResult = {
      nombreTotalElements: 19,
      nombreTotalPages: 2,
      numeroPageCourante: 0,
      nombreElementsPageCourante: 15,
      nombreElementsParPage: 15,
      hasNext: true,
      hasPrevious: false,
      dossiers: [{
        id: 2,
        departement: '31',
        thematique: {
          id: 1,
          codeParam: 'THEMA',
          libelleParam: null,
          code: 'AGRI',
          libelle: 'Agriculture'
        },
        intitule: 'test',
        beneficiaire: null,
        noOrdre: 2,
        phase: null,
        refusDossier: null,
        dateDemande: null,
        origineDemande: null,
        noOrdreFormate: '00002',
        numeroDossier: 'AGRI-31-00002'
      }, {
        id: 3,
        departement: '31',
        thematique: {
          id: 1,
          codeParam: 'THEMA',
          libelleParam: null,
          code: 'AGRI',
          libelle: 'Agriculture'
        },
        intitule: 'test1',
        beneficiaire: null,
        noOrdre: 3,
        phase: null,
        refusDossier: null,
        dateDemande: null,
        origineDemande: null,
        noOrdreFormate: '00003',
        numeroDossier: 'AGRI-31-00003'
      }],
      premierePage: true,
      dernierePage: false
    };

    dossierService.getResultatRecherche(dummyConfigCard).subscribe(data => {
      // test of differents criteria
      expect(data.nombreTotalElements).toBe(19);
      expect(data.nombreTotalPages).toBe(2);
      expect(data.numeroPageCourante).toBe(0);
      expect(data.nombreElementsPageCourante).toBe(15);
      expect(data.nombreElementsParPage).toBe(15);
      expect(data.hasNext).toBe(true);
      expect(data.hasPrevious).toBe(false);
      expect(data.dossiers.length).toBe(2);
      expect(data.premierePage).toBe(true);
      expect(data.dernierePage).toBe(false);
      expect(data.dossiers).toEqual(dummySearchResult.dossiers, '#getResultatRecherche\'s method should return the proper object');
    });

    // configuration of mocked response
    const req = httpMock.expectOne(appService.environment.BACKEND + '/dossier?idThematique=1&nombreElementPage=15');
    expect(req.request.method).toBe('GET');
    req.flush(dummySearchResult);
  });

  /**
 * unit test of 404 error
 */
  it('should return an 404 error if none of those params are given: "thematique", "departement", "numeroIncrement" and "codeBenef"',
    () => {

      const emsg = 'deliberate 404 error';
      const dummyConfigCard: Critere = {
        thematique: null,
        departement: null,
        numeroIncrement: null,
        codeBenef: null,
        pageAAficher: null,
        nbElemPerPage: 15
      };

      dossierService.getResultatRecherche(dummyConfigCard).subscribe(
        (data) => {
          fail('should have failed with the 404 error');
        },
        (err) => {
          expect(err.status).toEqual(404, 'status');
          expect(err.error).toEqual(emsg, 'message');
        });

      const req = httpMock.expectOne(appService.environment.BACKEND + `/dossier?nombreElementPage=15`);
      req.flush(emsg, { status: 404, statusText: 'Not Found' });
    });

  /**
  * unit test of getBeneficaire function
  */
  it('should return beneficiaire exist',
    () => {
      // intialization of Beneficaire
      const dummyBeneficiaire: Beneficiaire = {
        actif: true,
        reference: '01234567M',
        raisonSociale: 'raison sociale de '
      };

      const reference = '01234567M';

      dossierService.getBeneficaire(reference)
        .subscribe(
          (data) => {
            expect(data).toBeDefined();
            expect(data.reference).toEqual(reference);
            expect(data.raisonSociale).toEqual('raison sociale de ');
            expect(data.actif).toBeTruthy();
          });

      const req = httpMock.expectOne({ method: 'GET', url: appService.environment.BACKEND + '/interlocuteur/01234567M' });
      req.flush(dummyBeneficiaire);
    });

  /**
  * unit test of getNatureRefus function
  */
  it('should be a list of natureRefus',
    () => {
      const dummyNatureList: NatureRefus[] = [
        { id: 22, libelle: 'Dossier abandonné', code: 'NEXFF' },
        { id: 23, libelle: 'Dossier non éligible en 2018', code: 'ABAND' }
      ];

      dossierService.getNatureRefus()
        .subscribe((listNature) => {
          expect(listNature).toBeDefined();
          expect(listNature.length).toBe(2);
          expect(listNature[0].libelle).toEqual('Dossier abandonné');
          expect(listNature[1].libelle).toEqual('Dossier non éligible en 2018');
        });

      const req = httpMock.expectOne({ method: 'GET', url: appService.environment.BACKEND + '/valeur/natureRefus' });
      req.flush(dummyNatureList);
    });

  /**
  * unit test of getOrigineDemande function
  */
  it('should be a list of OrigineDemande',
    () => {
      const dummyOriginDemandeList: OrigineDemande[] = [
        { id: 33, libelle: 'Mail', code: 'Mail' },
        { id: 34, libelle: 'Téléphone', code: 'TELE' }
      ];

      dossierService.getOrigineDemande()
        .subscribe((listOriginDemande) => {
          expect(listOriginDemande).toBeDefined();
          expect(listOriginDemande.length).toBe(2);
          expect(listOriginDemande[0].libelle).toEqual('Mail');
          expect(listOriginDemande[1].libelle).toEqual('Téléphone');
        });

      const req = httpMock.expectOne({ method: 'GET', url: appService.environment.BACKEND + '/valeur/origineDemande' });
      req.flush(dummyOriginDemandeList);
    });

  /**
  * unit test of updateDossier function
  */
  it('updateDossier should send a put request and return an Observable<Object> ' +
    'which contain the datas of the update "dossier" ', () => {

      const beneficiaire: Beneficiaire = {
        actif: true,
        reference: '01234567M',
        raisonSociale: 'raison sociale de ',

      };

      const dummyDossier: Dossier = {
        id: 4,
        departement: '31',
        thematique: {
          id: 1,
          codeParam: 'THEMA',
          libelleParam: null,
          code: 'AGRI',
          libelle: 'Agriculture'
        },
        intitule: 'test update dossier',
        beneficiaire: beneficiaire,
        referenceBenef: '',
        preDossier: null,
        responsableTechnique: null,
        noOrdre: 4,
        phase: null,
        refusDossier: null,
        dateDemande: null,
        origineDemande: null,
        noOrdreFormate: '00004',
        numeroDossier: 'AGRI-31-00004',
        numero_aid: null
      }


      dossierService.updateDossier(dummyDossier).subscribe(data => {

        expect(data.id).toBe(4);
        expect(data.departement).toBe('31');
        expect(data.thematique).toEqual({
          id: 1,
          codeParam: 'THEMA',
          libelleParam: null,
          code: 'AGRI',
          libelle: 'Agriculture'
        });
        expect(data.intitule).toBe('test update dossier');
        expect(data.beneficiaire).toBe(beneficiaire);
        expect(data.noOrdre).toBe(4);
        expect(data.phase).toBe(null);
        expect(data.refusDossier).toBe(null);
        expect(data.noOrdreFormate).toBe('00004');
        expect(data.numeroDossier).toBe('AGRI-31-00004',
          '#createDossier\'s method should return the proper object');
        expect(data.referenceBenef).toBe('');
      });

      // configuration de la réponse mockée
      const req = httpMock.expectOne(appService.environment.BACKEND + '/dossier');
      expect(req.request.method).toBe('PUT');
      req.flush(dummyDossier);
    });

  /**
  * unit test of refuse dossier function
  */
  it('should be a dossierResult object with refusDossier object attached',
    () => {
      const natureRefusSelect: NatureRefus = { 'id': 22, 'libelle': 'Dossier abandonné', 'code': 'NEXFF' }
      const refusDossierToSend: RefusDossier = {
        'motifRefus': 'testing', 'natureRefus': natureRefusSelect
      }

      const idDossier = 10;
      const dummmyDossier: Dossier = {
        id: 10,
        beneficiaire: { reference: '12455477P', raisonSociale: 'raison sociale de 12455477P', actif: true },
        thematique: null,
        departement: null,
        intitule: 'AABBCCDD',
        phase: 'T40',
        refusDossier: refusDossierToSend,
        noOrdre: 1,
        noOrdreFormate: 'string',
        numeroDossier: 'string',
        referenceBenef: '',
        preDossier: null,
        numero_aid : 'l124587',
        responsableTechnique: {
          'login': 'test',
          'prenom': 'prenom dd',
          'nom': 'mon nom'
        },
      }

      dossierService.refuseDossier(idDossier, refusDossierToSend)
        .subscribe((dossierRefus) => {
          expect(dossierRefus).toBeDefined();
          expect(dossierRefus.refusDossier.motifRefus).toEqual(refusDossierToSend.motifRefus);
          expect(dossierRefus.refusDossier.natureRefus).toEqual(refusDossierToSend.natureRefus);
          expect(dossierRefus.id).toEqual(idDossier);
          expect(dossierRefus.phase).toEqual('T40');
        });

      const req = httpMock.expectOne({ method: 'PUT', url: appService.environment.BACKEND + `/dossier/refus/${idDossier}` });
      req.flush(dummmyDossier);
    });


 /**
  * unit test of reactiveDossier function
  */
  it('should delete a nature and motif of refus when we reactive a dossier',
  () => {
    const natureRefus: NatureRefus = { 'id': 22, 'libelle': 'Dossier abandonné', 'code': 'NEXFF' }
    const refusDossier: RefusDossier = {
      'motifRefus': 'testing', 'natureRefus': natureRefus
    }

    const dummmyDossier: Dossier = {
      id: 10,
      beneficiaire: { reference: '12455477P', raisonSociale: 'raison sociale de 12455477P', actif: true },
      thematique: null,
      departement: null,
      intitule: 'AABBCCDD',
      phase: null,
      refusDossier: null,
      noOrdre: 1,
      noOrdreFormate: 'string',
      numeroDossier: 'string',
      referenceBenef: '',
      preDossier: null,
      responsableTechnique: {
        'login': 'test',
        'prenom': 'prenom dd',
        'nom': 'mon nom'
      },
      numero_aid : 'l124587'
    }

    dossierService.reactiverDossier(dummmyDossier.id)
      .subscribe((dossierRefus) => {
        expect(dossierRefus).toBeDefined();
        expect(dossierRefus.refusDossier).toBeNull();
        // expect(dossierRefus.refusDossier.natureRefus).toBeNull();
        expect(dossierRefus.id).toEqual(dummmyDossier.id);
        expect(dossierRefus.phase).toBeNull();
      });

    const req = httpMock.expectOne({ method: 'PUT', url: appService.environment.BACKEND + `/dossier/reactiver/${dummmyDossier.id}` });
    req.flush(dummmyDossier);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpMock.verify();
  });
});
