import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatSnackBar, MatSnackBarConfig, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { startWith, map } from 'rxjs/operators';

import { DossierCreate, Thematique, Departement, Beneficiaire, ResponsableTechnique } from './create-dossier.interface';
import { BenefRegex } from '../dossiers.interface';
import {
  fixIE11FormBug,
  snackbarConfigError,
  snackbarConfigSuccess,
  filterListValeur,
  sigaAutocompleteValidatorFactory,
  minSearchLength
} from 'app/shared/shared.interface';

import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';

import { DossierService } from './../dossiers.service';

/**
 * Component that creates SIGA dossiers
 */
@Component({
  selector: 'siga-create-dossier',
  templateUrl: './create-dossier.component.html',
  styleUrls: ['./create-dossier.component.scss'],
})
export class CreateDossierComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
  * The object reprensenting the whole dossier to be created
  */
  formDossier: FormGroup;

  thematiques: Thematique[] = null;
  filteredThematiques: Observable<Thematique[]>;
  readonly thematiqueValidatorKey = 'thematiqueNotFound';
  get thematiqueControl() { return this.formDossier.get('thematique'); }

  responsablesTech: ResponsableTechnique[] = null;
  filteredResponsablesTech: Observable<ResponsableTechnique[]>;
  readonly respTechValidatorKey = 'responsableTechNotFound';
  get respTechControl() { return this.formDossier.get('responsableTech'); }

  /**
   * List of possible departments for the creation
   */
  depts: Departement[] = null;
  filteredDepts: Observable<Departement[]>;
  readonly deptValidatorKey = 'deptNotFound';
  get deptControl() { return this.formDossier.get('dept'); }

  get intituleControl() { return this.formDossier.get('intitule'); }
  get benefNumberControl() { return this.formDossier.get('benef_number'); }
  get benefLibelleControl() { return this.formDossier.get('benef_libelle'); }

  beneficiaire: Beneficiaire = null;
  snackbarSubscription: Subscription;

  /**
   * Used to avoid multi-click from the user
   */
  submitted = false;

  /**
  * Exception handler if beneficaire does not exist
  */
  message: string;

  /**
   * Component dependencies
   * @param dialog used to display the popup
   * @param _snackbar used to display snackbars
   * @param _formBuilder used to create the form
   * @param _router handle manual navigation
   * @param _dossierService used to manage dossiers
   */
  constructor(
    public dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _dossierService: DossierService,
  ) { }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this.formDossier = this._formBuilder.group({
      thematique: ['', [Validators.required]],
      dept: ['', [Validators.required]],
      intitule: ['', [Validators.required, Validators.maxLength(80)]],
      benef_number: ['', [Validators.required, Validators.maxLength(9), Validators.pattern(BenefRegex)]],
      benef_libelle: [{ value: '', disabled: true }, [Validators.required]],
      responsableTech: ['', [Validators.required]]
    });

    // Bénéficiaire libelle handler
    this.benefNumberControl.valueChanges
      .subscribe((value: string) => {
        this.message = null;
        this.beneficiaire = null;

        if (!this.benefNumberControl.hasError('pattern') && !this.benefNumberControl.hasError('required')) {
          this.benefNumberControl.markAsTouched();
        }

        if (this.benefNumberControl.hasError('pattern') && this.benefNumberControl.value.length === 9) {
          this.benefNumberControl.markAsTouched();
        }

        if (this.benefNumberControl.valid) {
          const benef_number = (this.benefNumberControl.value as string).toUpperCase();
          this._dossierService.getBeneficaire(benef_number)
            .subscribe(
              (beneficiaire) => {
                this.beneficiaire = beneficiaire;
                this.benefLibelleControl.setValue(this.beneficiaire.raisonSociale);
                if (this.beneficiaire && !this.beneficiaire.actif) {
                  this.benefNumberControl.setErrors({ 'benefInactive': true });
                }
              },
              (error: any) => {
                this.benefNumberControl.setErrors({ 'benefNotFound': true });
                if (error.status === 500) {
                  this.message = error.error.message;
                  this.benefLibelleControl.setValue('');
                }
              });
        } else {
          this.benefLibelleControl.setValue('');
        }
      });

    this._dossierService.getThematiques()
      .subscribe(
        (thematiques) => {
          this.thematiques = thematiques;
          // Set synchronous validator once the data is available
          this.thematiqueControl.setValidators([
            this.thematiqueControl.validator,
            sigaAutocompleteValidatorFactory(this.thematiques, this.thematiqueValidatorKey)
          ]);

          // Allow auto-complete filtering on thematics
          this.filteredThematiques = this.thematiqueControl.valueChanges.pipe(
            startWith(''),
            map(value => (value && this.thematiqueControl.hasError(this.thematiqueValidatorKey)) ?
              filterListValeur(value, this.thematiques, minSearchLength) : this.thematiques.slice())
          );
        });

    this._dossierService.getDepts()
      .subscribe(
        (depts) => {
          this.depts = depts;
          // Set synchronous validator once the data is available
          this.deptControl.setValidators([
            this.deptControl.validator,
            sigaAutocompleteValidatorFactory(this.depts, this.deptValidatorKey)
          ]);

          // Allow auto-complete filtering
          this.filteredDepts = this.deptControl.valueChanges.pipe(
            startWith(''),
            map(value => (value && this.deptControl.hasError(this.deptValidatorKey)) ?
              filterListValeur(value, this.depts, minSearchLength) : this.depts.slice())
          );
        });

    this._dossierService.getResponsableTech()
      .subscribe(
        (responsablesTech) => {
          this.responsablesTech = responsablesTech;
          // Set synchronous validator once the data is available
          this.respTechControl.setValidators([
            this.respTechControl.validator,
            sigaAutocompleteValidatorFactory(this.responsablesTech, this.respTechValidatorKey)
          ]);

          // Allow auto-complete filtering on thematics
          this.filteredResponsablesTech = this.respTechControl.valueChanges.pipe(
            startWith(''),
            map(value => (value && this.respTechControl.hasError(this.respTechValidatorKey)) ?
              this.filterResponsablesTech(value) : this.responsablesTech.slice())
          );
        });
  }

  ngAfterViewInit() {
    fixIE11FormBug(this.formDossier);
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
   * Manages how a department should be displayed in the input
   * @param dept a given department to be formatted
   */
  displayDept(dept: Departement) {
    if (dept) {
      return `${dept.code} - ${dept.libelle}`;
    }
  }

  /**
   * Manages how a responsable technique should be displayed in the input
   * @param responsableTech a given responsable to be formatted
   */
  displayResponsableTech(responsableTech: ResponsableTechnique) {
    if (responsableTech) {
      return `${responsableTech.prenom}  ${responsableTech.nom}`;
    }
  }

  /**
  * Manages how the autocomplete list is filtered upon input
  * @param value user input
  */
  filterResponsablesTech(value: string) {
    return this.responsablesTech.filter(responsableTech => {
      let result = false;
      responsableTech.prenom.toLowerCase().split(' ').forEach(word => {
        if (word.search(value.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (responsableTech.nom.toLowerCase().search(value.toString().toLowerCase()) === 0) || result;
    });
  }

  close() {
    this._router.navigate(['/accueil']);
  }

  /**
   * Configures OK / KO Material Dialog and returns the reference
   */
  openConfirmDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.width = '350px';
    return this.dialog.open(ConfirmPopupComponent, dialogConfig);
  }

  /**
   * Implements the guard canDeactivate() logic to being redirected
   */
  canDeactivate(): Observable<boolean> | boolean {
    if (!this.formDossier.pristine && !this.submitted) {
      return this.openConfirmDialog()
        .beforeClose()
        .map((dialogResult: boolean) => {
          return dialogResult;
        });
    }
    return true;
  }

  onSubmit() {
    this.submitted = true;
    const deptId = (this.deptControl.value as Departement).id;
    const formattedDossier: DossierCreate = {
      beneficiaire: this.beneficiaire,
      departement: deptId.toString(),
      intitule: this.intituleControl.value,
      thematique: (this.thematiqueControl.value as Thematique),
      responsableTechnique: (this.respTechControl.value as ResponsableTechnique)
    };

    this._dossierService.createDossier(formattedDossier)
      .subscribe((dossier) => {
        const formattedDossierNumber = `${dossier.thematique.code}-${dossier.departement}-${dossier.noOrdreFormate}`
        this._snackbar.open(`Le dossier ${formattedDossierNumber} a bien été créé.`, 'X', snackbarConfigSuccess);
        // Redirect to update dossier
        this._router.navigate([`dossier/${dossier.id}`]);
      },
        (error: any) => {
          const snackBarAction =
            this._snackbar.open(`La création du dossier a échoué. Contacter l'administrateur.`, 'X', snackbarConfigError);
          this.snackbarSubscription = snackBarAction.afterDismissed()
            .subscribe(() => {
              console.error(error);
              this.submitted = false;
            });
        });
  }

  /**
   * Destroys pending subscriptions
   */
  ngOnDestroy() {
    if (this.snackbarSubscription) {
      this.snackbarSubscription.unsubscribe();
    }
  }
}
