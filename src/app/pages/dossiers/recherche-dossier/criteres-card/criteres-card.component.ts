import { Component, OnInit, OnChanges, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';

import { Critere } from '../recherche-dossier.interface';

import { Dossier, BenefRegex, IncrementRegex } from '../../dossiers.interface';
import { Thematique, Departement, ResponsableTechnique, Beneficiaire } from '../../create-dossier/create-dossier.interface';
import { fixIE11FormBug } from 'app/shared/shared.interface';

import { Subscription } from 'rxjs/Subscription';

import { DossierService } from '../../dossiers.service';

/**
 * Component that creates form of search
 */
@Component({
  selector: 'siga-criteres-card',
  templateUrl: './criteres-card.component.html',
  styleUrls: ['./criteres-card.component.scss'],
})
export class CritereCardComponent implements OnInit, OnChanges, AfterViewInit {

  /**
   * List of possible Thematics for the creation
   */
  @Input() thematiques: Thematique[] = null;

  /**
   * Filtered thematics depending on the user input
   */
  filteredThematiques: Observable<Thematique[]>;

  /**
   * List of possible departments for the creation
   */
  @Input() depts: Departement[] = null;

  /**
   * Filtered departments depending on the user input
   */
  filteredDepts: Observable<Departement[]>;

  /**
  * List of possible responsable techniques for the creation
  */
  @Input() responsablesTech: ResponsableTechnique[] = null;

  /**
  * Filtered responsable techniques depending on the user input
  */
  filteredResponsablesTech: Observable<ResponsableTechnique[]>;

  /**
   * event to go back to the parent component the configuration selected in the form
   */
  @Output() searchEventEmitter: EventEmitter<Critere> = new EventEmitter();

  /**
 * The beneficaire object to recupere
 */
  beneficiaire: Beneficiaire;

  /**
  * The object reprensenting the all critaria for search
  */
  formCritere: FormGroup;

  /**
   * TODO : Disallow multi-click
   */
  submitted = false;

  /**
   * Number. If the length of the serched input is above this number we search it also on the libelle
   */
  minSearchLength = 3

  /**
 * The Message of exception handler if beneficaire not exiist
 */
  message: string;

  /**
   *
   * @param formBuilder used to create the form
   * @param _dossierService used to manage dossiers
   */
  constructor(
    private formBuilder: FormBuilder,
    private _dossierService: DossierService,

  ) {
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    // Init form
    this.formCritere = this.formBuilder.group({
      thematique: ['', [this.thematiqueValidator()]],
      dept: ['', [this.deptValidator()]],
      numeroIncrement: ['', [Validators.pattern(IncrementRegex)]],
      responsableTech: ['', [this.responsableTechValidator()]],
      benefNumber: ['', [Validators.pattern(BenefRegex)]],
      benef_libelle: [{ value: '', disabled: true }]

    }, { validator: this.formCritereValidator() });

    // Bénéficiaire libelle handler
    this.formCritere.get('benefNumber').valueChanges.subscribe(
      (value) => {
        this.message = null;
        this.beneficiaire = null;

        if (!this.formCritere.get('benefNumber').hasError('pattern')
          && !this.formCritere.get('benefNumber').hasError('required')) {
          this.formCritere.get('benefNumber').markAsTouched();
        }

        if (this.formCritere.get('benefNumber').hasError('pattern')
          && this.formCritere.get('benefNumber').value.length === 9) {
          this.formCritere.get('benefNumber').markAsTouched();
        }

        if (this.formCritere.get('benefNumber').valid && this.formCritere.get('benefNumber').value !== '') {
          const benef_number = (this.formCritere.get('benefNumber').value as string).toUpperCase();
          this._dossierService.getBeneficaire(benef_number)
            .subscribe((beneficiaire) => {
              this.beneficiaire = beneficiaire;
              this.formCritere.get('benef_libelle').setValue(beneficiaire.raisonSociale);
              if (this.beneficiaire && !this.beneficiaire.actif) {
                this.formCritere.get('benefNumber').setErrors({ 'benefInactive': true });
              }
            },
              (error: any) => {
                if (error.status === 500) {
                  this.message = error.error.message;
                  this.formCritere.get('benefNumber').setErrors({ 'benefNotFound': true });
                  this.formCritere.get('benef_libelle').setValue('');
                }
              });
        } else {
          this.formCritere.get('benef_libelle').setValue('');
        }
      }
    );
  }

  ngOnChanges() {
    if (this.formCritere && this.thematiques) {
      // Initializes filtred thematiques list
      this.filteredThematiques = this.formCritere.get('thematique').valueChanges.pipe(
        startWith(''),
        map(value => (value && this.formCritere.get('thematique').hasError('thematiqueNotFound')) ?
          this.filterThematiques(value) : this.thematiques.slice())
      );
    }

    if (this.formCritere && this.depts) {
      // Initializes filtred departements list
      this.filteredDepts = this.formCritere.get('dept').valueChanges.pipe(
        startWith(''),
        map(value => (value && this.formCritere.get('dept').hasError('deptNotFound')) ? this.filterDepts(value) : this.depts.slice())
      );
    }

    if (this.formCritere && this.responsablesTech) {
      // Initializes filtred responsables technique list
      this.filteredResponsablesTech = this.formCritere.get('responsableTech').valueChanges.pipe(
        startWith(''),
        map(value => (value && this.formCritere.get('responsableTech').hasError('responsableTechNotFound')) ?
          this.filterResponsablesTech(value) : this.responsablesTech.slice())
      );
    }
  }

  ngAfterViewInit() {
    fixIE11FormBug(this.formCritere);
  }

  /**
   * Custom validator for thematiques
   */
  thematiqueValidator() {
    return (group: FormGroup): { [key: string]: any } => {
      let foundValue = false;

      if (this.thematiques) {
        this.thematiques.forEach((thematique) => {
          if (thematique.id === group.value.id) {
            foundValue = true;
          }
        });
      }

      if (!foundValue && group.value) {
        return { 'thematiqueNotFound': true };
      }

      return null;
    };
  }

  /**
* Manages how a thematic should be displayed in the input
* @param thematique a given thematic to be formatted
*/
  displayThematique(thematique: Thematique) {
    if (thematique) {
      return `${thematique.code} - ${thematique.libelle}`;
    }
  }

  /**
   * Custom validator for départements
   */
  deptValidator() {
    return (group: FormGroup): { [key: string]: any } => {
      let foundValue = false;

      if (this.depts) {
        this.depts.forEach((dept) => {
          if (dept.id === group.value.id) {
            foundValue = true;
          }
        });
      }

      if (!foundValue && group.value) {
        return { 'deptNotFound': true };
      }

      return null;
    };
  }

  /**
 * Manages how a departement should be displayed in the input
 * @param dept a given departement to be formatted
 */
  displayDept(dept: Departement) {
    if (dept) {
      return `${dept.id} - ${dept.libelle}`;
    }
  }

  /**
 * Custom validator for responsables techniques
 */
  responsableTechValidator() {
    return (group: FormGroup): { [key: string]: any } => {
      let foundValue = false;

      if (this.responsablesTech) {
        this.responsablesTech.forEach((responsableTech) => {
          if (responsableTech.login === group.value.login) {
            foundValue = true;
          }
        });
      }

      if (!foundValue && group.value) {
        return { 'responsableTechNotFound': true };
      }

      return null;
    };
  }

  /**
* Manages how a responsable technique should be displayed in the input
* @param responsableTech a given responsable technique to be formatted
*/
  displayResponsableTech(responsableTech: ResponsableTechnique) {
    if (responsableTech) {
      return `${responsableTech.prenom}  ${responsableTech.nom}`;
    }
  }

  /**
   * permet de filter la liste des départements en fonction de 'value'
   * @param value valeur entrée par l'utilisateur dans l'input
   */
  filterDepts(value: string) {
    return this.depts.filter(dept => {
      let result = false;
      if (value.length < this.minSearchLength) {
        return (dept.id.toString().toLowerCase().search(value.toString().toLowerCase()) !== -1)
      }
      dept.libelle.toLowerCase().split(' ').forEach(word => {
        if (word.search(value.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (dept.id.toString().toLowerCase().search(value.toString().toLowerCase()) !== -1) || result;
    });
  }

  /**
   * permet de filter la liste des thématiques en fonction de 'value'
   * @param value valeur entrée par l'utilisateur dans l'input
   */
  filterThematiques(value: string) {
    return this.thematiques.filter(thematique => {
      let result = false;
      if (value.length < this.minSearchLength) {
        return (thematique.code.toLowerCase().search(value.toString().toLowerCase()) === 0)
      }
      thematique.libelle.toLowerCase().split(' ').forEach(word => {
        if (word.search(value.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (thematique.code.toLowerCase().search(value.toString().toLowerCase()) === 0) || result;
    });
  }

  /**
  * permet de filter la liste des responsable techniques en fonction de 'value'
  * @param value valeur entrée par l'utilisateur dans l'input
  */
  filterResponsablesTech(value: string) {
    return this.responsablesTech.filter(responsableTech => {
      let result = false;
      responsableTech.nom.toLowerCase().split(' ').forEach(word => {
        if (word.search(value.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (responsableTech.prenom.toLowerCase().search(value.toString().toLowerCase()) === 0) || result;
    });
  }


  /**
   * custom validator that verify at least one of the fields in the form is filled
   */
  formCritereValidator() {
    return (group: FormGroup) => {

      if (this.formCritere && this.formCritere.get('thematique').value === ''
        && this.formCritere.get('dept').value === ''
        && this.formCritere.get('responsableTech').value === ''
        && this.formCritere.get('numeroIncrement').value === ''
        && this.formCritere.get('benefNumber').value === '') {
        return { 'noCritereFieldInputed': true }
      }
      return null;
    }
  }

  /**
   * Submit data
   */
  onSubmit() {
    const critereToSend: Critere = {
      thematique: this.formCritere.value.thematique ? this.formCritere.value.thematique.id : null,
      departement: this.formCritere.value.dept ? this.formCritere.value.dept.id : null,
      responsableTech: this.formCritere.value.responsableTech ? this.formCritere.value.responsableTech.login : null,
      numeroIncrement: this.formCritere.value.numeroIncrement ? this.formCritere.value.numeroIncrement : null,
      codeBenef: this.formCritere.value.benefNumber ? this.formCritere.value.benefNumber.toString().toUpperCase() : null,
      pageAAficher: null,
      nbElemPerPage: null
    }
    this.searchEventEmitter.emit(critereToSend);
  }
}
