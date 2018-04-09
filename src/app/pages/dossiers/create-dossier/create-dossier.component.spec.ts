import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'app/theme/material/material.module';

import { CreateDossierComponent } from './create-dossier.component';

import { Dossier } from '../dossiers.interface';
import { DossierCreate, Thematique, Departement, Beneficiaire, ResponsableTechnique } from './create-dossier.interface'

import { DossierService } from '../dossiers.service';
import { DossierServiceStub } from '../dossiers.service.spec';

describe('Unit tests of CreateDossierComponent', () => {
  const mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };
  let componentInstance: CreateDossierComponent;
  let fixture: ComponentFixture<CreateDossierComponent>;
  let dossierService: DossierService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MaterialModule,
        FlexLayoutModule,
        RouterTestingModule
      ],
      declarations: [
        CreateDossierComponent
      ],
      providers: [
        { provide: DossierService, useClass: DossierServiceStub },
        { provide: Router, useValue: mockRouter }
      ]
    });

    fixture = TestBed.createComponent(CreateDossierComponent);
    componentInstance = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('should have an invalid form by default (empty)', () => {
    expect(componentInstance.formDossier.valid).toBeFalsy();
  });

  it('should manage an invalid Thematique field value', () => {
    const form = componentInstance.formDossier;
    const thematiqueControl = componentInstance.thematiqueControl;
    const thematiqueValidatorKey = componentInstance.thematiqueValidatorKey;

    expect(thematiqueControl.errors['required']).toBeTruthy();

    const thematiqueInvalidValue: Thematique = { id: 0, code: 'INVA', libelle: 'Invalid thématique' };
    thematiqueControl.setValue(thematiqueInvalidValue);

    expect(thematiqueControl.errors[thematiqueValidatorKey]).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid Departement field value', () => {
    const form = componentInstance.formDossier;
    const deptControl = componentInstance.deptControl;
    const deptValidatorKey = componentInstance.deptValidatorKey;

    expect(deptControl.errors['required']).toBeTruthy();

    const deptInvalidValue: Departement = { id: '0', code: '', libelle: 'Département inconnu' };
    deptControl.setValue(deptInvalidValue);

    expect(deptControl.errors[deptValidatorKey]).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid Intitule field value', () => {
    const form = componentInstance.formDossier;
    const intituleControl = componentInstance.intituleControl;

    expect(intituleControl.errors['required']).toBeTruthy();

    const intituleInvalidValue = '01234567890123456789012345678901234567890123456789012345678901234567890123456789e';
    intituleControl.setValue(intituleInvalidValue);

    expect(intituleControl.errors['maxlength']).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid Numero Beneficiaire field value', () => {
    const form = componentInstance.formDossier;
    const benefNumberControl = componentInstance.benefNumberControl;
    let benefNumberInvalidValue = null;

    expect(benefNumberControl.errors['required']).toBeTruthy();

    benefNumberInvalidValue = '12345678ee';
    benefNumberControl.setValue(benefNumberInvalidValue);

    expect(benefNumberControl.errors['maxlength']).toBeTruthy();
    expect(benefNumberControl.errors['pattern']).toBeTruthy();

    benefNumberInvalidValue = '123456780';
    benefNumberControl.setValue(benefNumberInvalidValue);

    expect(benefNumberControl.errors['maxlength']).toBeFalsy();
    expect(benefNumberControl.errors['pattern']).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should manage an invalid Libelle Beneficiaire field value', () => {
    const form = componentInstance.formDossier;
    const benefLibelleControl = componentInstance.benefLibelleControl;

    expect(benefLibelleControl.disabled).toBeTruthy();
    // Disabled field does not triggers require validator
    expect(benefLibelleControl.errors).toBeNull();
    expect(form.valid).toBeFalsy();
  });

  it('should test the link between Numero Beneficiaire and Libelle Beneficiaire fields', () => {
    const benefNumberControl = componentInstance.benefNumberControl;
    const benefLibelleControl = componentInstance.benefLibelleControl;

    const benefNumberInvalidValue = '12345678ee';
    benefNumberControl.setValue(benefNumberInvalidValue);
    expect(benefLibelleControl.value).toBe('');
    expect(benefLibelleControl.disabled).toBeTruthy();

    const benefNumberValidValue = '01234567M';
    benefNumberControl.setValue(benefNumberValidValue);
    expect(benefLibelleControl.value).toBe('raison sociale de 01234567M');
    expect(benefLibelleControl.disabled).toBeTruthy();
  });

  it('should manage an invalid Responsable Technique field value', () => {
    const form = componentInstance.formDossier;
    const respTechControl = componentInstance.respTechControl;
    const respTechValidatorKey = componentInstance.respTechValidatorKey;

    expect(respTechControl.errors['required']).toBeTruthy();

    const responsableTechInvalidValue: ResponsableTechnique = { login: '', prenom: 'INVA', nom: 'Invalid responsalbe technique' };
    respTechControl.setValue(responsableTechInvalidValue);

    expect(respTechControl.errors[respTechValidatorKey]).toBeTruthy();
    expect(form.valid).toBeFalsy();
  });

  it('should call the createDossier service when the form is valid', () => {
    const form = componentInstance.formDossier;
    const thematiqueControl = componentInstance.thematiqueControl;
    const deptControl = componentInstance.deptControl;
    const intituleControl = componentInstance.intituleControl;
    const benefNumberControl = componentInstance.benefNumberControl;
    const respTechControl = componentInstance.respTechControl;

    expect(form.valid).toBeFalsy();

    // Gather the same JS reference from the component to avoid 'ObjectNotFound' validator errors
    const thematiqueValidValue: Thematique = componentInstance.thematiques[0];
    thematiqueControl.setValue(thematiqueValidValue);
    const deptValidValue: Departement = componentInstance.depts[0];
    deptControl.setValue(deptValidValue);
    const intituleValue = 'Ceci est un libellé valide';
    intituleControl.setValue(intituleValue);
    const benefNumberValue = '01234567M';
    benefNumberControl.setValue(benefNumberValue);
    const responsableTechValidValue: ResponsableTechnique = componentInstance.responsablesTech[0];
    respTechControl.setValue(responsableTechValidValue);

    expect(form.valid).toBeTruthy();

    dossierService = fixture.debugElement.injector.get(DossierService);
    const spyOnSubmit = spyOn(dossierService, 'createDossier').and.callThrough();
    expect(spyOnSubmit.calls.any()).toBe(false, 'the service haven\'t been called yet');

    componentInstance.onSubmit();

    expect(spyOnSubmit.calls.any()).toBe(true, 'the service have been called');
    // Use of mockRouter to avoid navigating for real, making the test crash and fail
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });
});
