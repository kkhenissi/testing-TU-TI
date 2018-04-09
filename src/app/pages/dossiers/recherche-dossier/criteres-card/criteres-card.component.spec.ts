import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';
import { By } from '@angular/platform-browser';

import { NgaModule } from 'app/theme/nga.module';

import { Critere } from '../recherche-dossier.interface';
import { Thematique, Departement, Beneficiaire, ResponsableTechnique } from '../../create-dossier/create-dossier.interface';
import { Dossier } from '../../dossiers.interface';

import { CritereCardComponent } from './criteres-card.component';

import { DossierService } from '../../dossiers.service';


/**
 * Stub of DossierService
 * @see DossierService
 */
class CreationDossierServiceStub {

  getBeneficaire(reference: string): Observable<Beneficiaire> {

    const beneficiaire: Beneficiaire = {
      actif: true,
      reference: '01234567M',
      raisonSociale: 'raison sociale de 01234567M'
    };
    return Observable.of(beneficiaire);
  }
}

/**
 * Unit Test of CritereCardComponent
 */
describe('CritereCardComponent', () => {

  let component: CritereCardComponent;
  let fixture: ComponentFixture<CritereCardComponent>;
  let button: DebugElement;
  const responsableList: ResponsableTechnique[] = [
    {
      login: 'Jean',
      prenom: 'DUPONT',
      nom: 'DUPONT',
    },
    {
      login: 'Oierre',
      prenom: 'DURANTD',
      nom: 'DURANTD',
    }
  ];
  const thematiquesList: Thematique[] = [
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
  const depts: Departement[] = [
    {
      id: '09',
      code: '09',
      libelle: 'Ariège'
    },
    {
      id: '11',
      code: '11',
      libelle: 'Aude'
    }
  ];

  /**
 * Unit Test of CritereCardComponent
 */
  describe('unit tests => ', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          NgaModule.forRoot()
        ],
        declarations: [
          CritereCardComponent,
        ],
        schemas: [
          NO_ERRORS_SCHEMA
        ],
        providers: [
          { provide: DossierService, useClass: CreationDossierServiceStub }
        ]
      });

      fixture = TestBed.createComponent(CritereCardComponent);
      component = fixture.componentInstance;

      // component.thematiques = thematiquesList;
      // component.depts = depts;
      // component.responsablesTech = responsableList;
    });

    /**
    * filtered lists initialize correctly
    */
    xit('filtered lists initialize correctly', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();

      // filtered lists initialize correctly
      component.filteredDepts.subscribe((filteredDepts) => {
        expect(filteredDepts).toEqual(component.depts, 'pas de valeur dans le filtre')
      });
      component.filteredThematiques.subscribe((filteredThematiques) => {
        expect(filteredThematiques).toEqual(component.thematiques, 'pas de valeur dans le filtre')
      });
    });

    /**
    * the formular correctly initialised
    */
    xit('is the formular correctly initialised', () => {
      fixture.detectChanges();

      // error if no field is filled
      expect(component.formCritere.errors).toBeTruthy('pas de champ renseignés pour le moment => erreur noCritereFieldInputed');
      expect(component.formCritere.errors).toEqual({ noCritereFieldInputed: true });

      // error if the thematic entered is not in the predefined list
      component.formCritere.controls['thematique'].setValue('TOTO');
      expect(component.formCritere.controls['thematique'].errors)
        .toBeTruthy('thematique renseignée non existante => erreur thematiqueNotFound');
      expect(component.formCritere.controls['thematique'].errors).toEqual({ thematiqueNotFound: true });

      // no error if the thematic entered is in the predefined list
      component.formCritere.controls['thematique'].setValue(thematiquesList[0]);
      expect(component.formCritere.controls['thematique'].errors)
        .toBeFalsy('thematique renseignée  existante => pas d\'erreur');

      // error if the entered department is not in the predefined list
      component.formCritere.controls['dept'].setValue('TOTO');
      expect(component.formCritere.controls['dept'].errors)
        .toBeTruthy('département renseigné non existant => erreur deptNotFound');
      expect(component.formCritere.controls['dept'].errors).toEqual({ deptNotFound: true });

      // no error if the department entered is in the predefined list
      component.formCritere.controls['dept'].setValue(depts[0]);
      expect(component.formCritere.controls['dept'].errors)
        .toBeFalsy('département renseigné  existant => pas d\'erreur');

      // error if the increment number entered is not valid
      component.formCritere.controls['numeroIncrement'].setValue('0123');
      expect(component.formCritere.controls['numeroIncrement'].errors)
        .toBeTruthy('numéro d\'incrément renseigné est invalide => erreur pattern:');
      expect(component.formCritere.controls['numeroIncrement'].errors)
        .toEqual({ pattern: { requiredPattern: '/^(\\d){5}$/', actualValue: '0123' } });

      // no error if the entered increment number is valid
      component.formCritere.controls['numeroIncrement'].setValue('01234');
      expect(component.formCritere.controls['numeroIncrement'].errors)
        .toBeFalsy('numéro d\'incrément renseigné est valide => pas d\'erreur');

      // erreur si le numéro de bénéficiaire renseigné n'est pas valide
      component.formCritere.controls['benefNumber'].setValue('1BC67A');
      expect(component.formCritere.controls['benefNumber'].errors)
        .toBeTruthy('numéro d\'incrément renseigné est invalide => erreur pattern:');
      expect(component.formCritere.controls['benefNumber'].errors)
        .toEqual({ pattern: { requiredPattern: '/^(\\d){8}([A-Za-z])$/', actualValue: '1BC67A' } });

      // error if the beneficiary number entered is not valid
      component.formCritere.controls['benefNumber'].setValue('12345678A');
      expect(component.formCritere.controls['benefNumber'].errors)
        .toBeFalsy('numéro d\'incrément renseigné est valide => pas d\'erreur');

      // disable valid button  when the form is valid and beneficaire is inactive
      component.beneficiaire.actif = false;
      button = fixture.debugElement.query(By.css('button[type=submit]'));
      expect(button.nativeElement.disabled).toBeTruthy();

      // disable valid button  when the form is valid and beneficaire dosen't exist
      component.beneficiaire = null;
      button = fixture.debugElement.query(By.css('button[type=submit]'));
      expect(button.nativeElement.disabled).toBeTruthy();

    });

    /**
   *  form valid when filled
   *  - when numéro is invalid, libellé is still empty and disabled
   *  - when numéro value is valid, libellé equals 'BOUCHON' and maxlength is not exceeded
   */
    it('numéro and libellé dependence', () => {
      fixture.detectChanges();
      const benef_libelle = component.formCritere.controls['benef_libelle'];

      // When numéro is invalid, libellé is still empty and disabled
      const benef_numberInvalidValue = '12345678ee';
      component.formCritere.get('benefNumber').setValue(benef_numberInvalidValue);
      expect(benef_libelle.value).toBe('');
      expect(benef_libelle.disabled).toBeTruthy();

      // When numéro value is valid, libellé equals 'BOUCHON' and maxlength is not exceeded
      const benef_numberValidValue = '01234567M';
      component.formCritere.get('benefNumber').setValue(benef_numberValidValue);
      expect(benef_libelle.value).toBe('raison sociale de 01234567M');
      expect(benef_libelle.disabled).toBeTruthy();
      const errors = benef_libelle.errors || {};
      expect(errors['required']).toBeFalsy();
      expect(errors['maxlength']).toBeFalsy();
    });


    /**
    *  filterDepts should return the list correctly filtered
    */
    xit('filterDepts should return the list correctly filtered', () => {
      fixture.detectChanges();
      let resultSearch: Departement[];

      resultSearch = component.depts.filter(element => {
        if (element.id.toString().toLowerCase().search('a') !== -1) {
          return element
        }
      });

      expect(component.filterDepts('A')).toEqual(resultSearch);

      resultSearch = component.depts.filter(element => {
        if (element.id.toString().toLowerCase().search('3') !== -1) {
          return element
        }
      });

      resultSearch = component.depts.filter(element => {
        let result = false;
        element.libelle.toLowerCase().split(' ').forEach(word => {
          if (word.search('aut') === 0) {
            result = true;
          }
        });
        return (element.id.toString().toLowerCase().search('aut') !== -1) || result;
      });

      expect(component.filterDepts('AUT')).toEqual(resultSearch);

      resultSearch = component.depts.filter(element => {
        let result = false;
        element.libelle.toLowerCase().split(' ').forEach(word => {
          if (word.search('hau') === 0) {
            result = true;
          }
        });
        return (element.id.toString().toLowerCase().search('hau') !== -1) || result;
      });

      expect(component.filterDepts('HAU')).toEqual(resultSearch);

    });

    /**
    *  filterThematiques should return the list correctly filtered
    */
    xit('filterThematiques should return the list correctly filtered', () => {
      fixture.detectChanges();
      let resultSearch: Thematique[];

      resultSearch = component.thematiques.filter(element => {
        if (element.id.toString().toLowerCase().search('y') !== -1) {
          return element
        }
      });

      expect(component.filterThematiques('Y')).toEqual(resultSearch);

      resultSearch = component.thematiques.filter(element => {
        if (element.id.toString().toLowerCase().search('a') !== -1) {
          return element
        }
      });

      resultSearch = component.thematiques.filter(element => {
        let result = false;
        element.libelle.toLowerCase().split(' ').forEach(word => {
          if (word.search('qua') === 0) {
            result = true;
          }
        });
        return (element.id.toString().toLowerCase().search('qua') !== -1) || result;
      });

      expect(component.filterThematiques('QUA')).toEqual(resultSearch);

      resultSearch = component.thematiques.filter(element => {
        let result = false;
        element.libelle.toLowerCase().split(' ').forEach(word => {
          if (word.search('agr') === 0) {
            result = true;
          }
        });
        return (element.id.toString().toLowerCase().search('agr') !== -1) || result;
      });

      expect(component.filterThematiques('AGR')).toEqual(resultSearch);

    });

    /**
    *  inputing some value in "depts" and "thematique" inputs in the formular
    */
    xit('inputing some value in "depts" and "thematique" inputs in the formular should update the filtered lists thought some functions',
      () => {
        fixture.detectChanges();

        spyOn(component, 'filterDepts');
        component.formCritere.controls['dept'].setValue('3');
        expect(component.filterDepts).toHaveBeenCalled();

        spyOn(component, 'filterThematiques');
        component.formCritere.controls['thematique'].setValue('3');
        expect(component.filterThematiques).toHaveBeenCalled();
      }
    );

    it('#displayDept should return the string properly formated', () => {
      fixture.detectChanges();

      expect(component.displayDept(depts[1])).toEqual(depts[1].id + ' - ' + depts[1].libelle);
    });

    it('#displayThematique should return the string properly formated', () => {
      fixture.detectChanges();

      expect(component.displayThematique(thematiquesList[1])).toEqual(thematiquesList[1].code + ' - ' + thematiquesList[1].libelle);
    });

    it('#onSubmit should return emmit the proper object', () => {
      fixture.detectChanges();

      spyOn(component.searchEventEmitter, 'emit');
      component.onSubmit();
      expect(component.searchEventEmitter.emit).toHaveBeenCalledWith({
        thematique: null,
        responsableTech: null,
        departement: null,
        numeroIncrement: null,
        codeBenef: null,
        pageAAficher: null,
        nbElemPerPage: null
      });
    });

  });

  /**
  * integration test
  */
  describe('integration test => ', () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          NgaModule.forRoot()
        ],
        declarations: [
          CritereCardComponent,
        ],
        providers: [
          { provide: DossierService, useClass: CreationDossierServiceStub }
        ]
      });

      fixture = TestBed.createComponent(CritereCardComponent);
      component = fixture.componentInstance;

      component.thematiques = thematiquesList;
      component.depts = depts;
      component.responsablesTech = responsableList;
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });
});
