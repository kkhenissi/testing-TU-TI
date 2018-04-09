import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBarConfig, MatSnackBar, MatButton, MatTooltipModule } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { startWith } from 'rxjs/operators/startWith';
import { map } from 'rxjs/operators/map';

import { Dossier, BenefRegex, FrenchDateRegex } from '../dossiers.interface';
import { DossierUpdate, OrigineDemande } from './dossier.interface';
import { fixButtonRippleEffectBug, fixIE11FormBug, snackbarConfigError, snackbarConfigSuccess } from 'app/shared/shared.interface';

import { ConfirmPopupComponent } from 'app/shared/confirm-popup/confirm-popup.component';
import { RefuseDossierPopupComponent } from '../refuse-dossier-popup/refuse-dossier-popup.component';

import { DossierService, ComponentViewRightMode } from '../dossiers.service';
import { Beneficiaire } from '../create-dossier/create-dossier.interface';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Component that update SIGA dossiers
 */
@Component({
  templateUrl: './dossier.component.html',
  styleUrls: ['./dossier.component.scss'],
})

export class DossierComponent extends ComponentViewRightMode implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Refuse dossier button reference
   */
  @ViewChild('button') private button: MatButton;

  /**
   * The object reprensenting the first part of the dossier to be updated
   */
  formUpdateDossier: FormGroup;

  /**
  * List of possible OrigineDemandes for the creation
  */
  origineDemandes: OrigineDemande[] = null;
  filteredOrigineDemandes: Observable<OrigineDemande[]>;

  /**
   * The subscription of the snackbar
   */
  snackbarSubscription: Subscription;

  /**
   * Used to avoid multi-click from the user
   */
  submitted = false;

  /**
  * The Message of exception handler if beneficaire does not exist
  */
  message: string;

  /**
  * The nature of refuse
  */
  nature: String;

  /**
  * The Motif of dossier
  */
  motif: String;
  libelNature: String = '';
  libelMotif: String = '';


  maxDate = new Date();
  minDate = new Date(1950, 0, 1);

  /**
   * Component dependencies
   * @param dialog used to display the popup
   * @param dossierService used to manage dossiers
   * @param _snackbar used to display snackbars
   * @param _formBuilder used to create the form
   * @param _router handle manual navigation
   */
  constructor(
    public dialog: MatDialog,
    public dossierService: DossierService,
    private _snackbar: MatSnackBar,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    super(dossierService);
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    this._route.params
      .subscribe(params => {
        const dossierId: number = params['dossierId'];
        this.dossierService.getDossier(dossierId)
          .subscribe(
            (dossier) => {
              this.dossierService.dossier = dossier;
              this.displayTooltipRefus(this.dossierService.dossier.refusDossier);
              this.updateFormData(this.dossierService.dossier);
              if (this.viewRight) {
                this.formUpdateDossier.disable();
              } else {
                // TEMPORARY
                this.formUpdateDossier.get('phase').setValue('P00');
              }
            },
            (error: HttpErrorResponse) => {
              this._snackbar
                .open(`Le dossier n° ${dossierId} est introuvable. Veuillez rechercher un dossier existant.`, 'X', snackbarConfigError);
              this._router.navigate(['/accueil']);
            });
      });

    this.formUpdateDossier = this._formBuilder.group({
      intitule: ['', [Validators.maxLength(80)]],
      referenceBenef: ['', [Validators.maxLength(9), Validators.required, Validators.pattern(BenefRegex)]],
      benef_libelle: [{ value: '', disabled: true }, [Validators.maxLength(9)]],
      phase: [{ value: '', disabled: true }, []],
      dateDemande: ['', []],
      origineDemande: ['', [this.origineDemandeValidator()]],
      numero_aid: [{ value: '', disabled: true }, []]
    });

    this.dossierService.getOrigineDemande()
      .subscribe((origineDemandes) => {
        this.origineDemandes = origineDemandes;
        // Allow auto-complete filtering on thematics
        this.filteredOrigineDemandes = this.formUpdateDossier.get('origineDemande').valueChanges
          .pipe(
            startWith(''),
            map(value => (value && this.formUpdateDossier.get('origineDemande').hasError('origineDemandeNotFound')) ?
              this.filterOrigineDemandes(value) : this.origineDemandes.slice())
          );
      });
  }

  /**
   * Patches the values from the service in the form
   */
  updateFormData(dossier: Dossier) {
    this.formUpdateDossier.patchValue({
      referenceBenef: dossier.beneficiaire.reference,
      intitule: dossier.intitule,
      phase: dossier.phase,
      origineDemande: dossier.origineDemande,
      dateDemande: dossier.dateDemande,
      benef_libelle: dossier.beneficiaire.raisonSociale,
      numero_aid: dossier.numero_aid
    });

    // Bénéficiaire libelle handler
    this.formUpdateDossier.get('referenceBenef').valueChanges
      .subscribe(
        (value) => {
          if (this.formUpdateDossier.disabled === false) {
            this.message = null;
            this.dossierService.dossier.beneficiaire = null;

            if (!this.formUpdateDossier.get('referenceBenef').hasError('pattern')
              && !this.formUpdateDossier.get('referenceBenef').hasError('required')) {
              this.formUpdateDossier.get('referenceBenef').markAsTouched();
            }

            if (this.formUpdateDossier.get('referenceBenef').hasError('pattern')
              && this.formUpdateDossier.get('referenceBenef').value.length === 9) {
              this.formUpdateDossier.get('referenceBenef').markAsTouched();
            }

            if (this.formUpdateDossier.get('referenceBenef').valid
              && this.formUpdateDossier.get('referenceBenef').value !== '') {
              const benef_number = (this.formUpdateDossier.get('referenceBenef').value as string).toUpperCase();
              this.dossierService.getBeneficaire(benef_number)
                .subscribe((beneficiaire) => {
                  this.dossierService.dossier.beneficiaire = beneficiaire;
                  this.formUpdateDossier.get('benef_libelle').setValue(this.dossierService.dossier.beneficiaire.raisonSociale);
                  if (!beneficiaire.actif) {
                    this.formUpdateDossier.get('referenceBenef').setErrors({ 'benefInactive': true });
                  }
                },
                  (error: HttpErrorResponse) => {
                    if (error.status === 500) {
                      this.message = error.error.message;
                      this.formUpdateDossier.get('referenceBenef').setErrors({ 'benefNotFound': true });
                      this.formUpdateDossier.get('benef_libelle').setValue('');
                    }
                  });
            } else {
              this.formUpdateDossier.get('benef_libelle').setValue('');
            }
          }
        }
      );
  }

  ngAfterViewInit() {
    fixIE11FormBug(this.formUpdateDossier);
  }

  origineDemandeValidator() {
    return (group: AbstractControl): { [key: string]: boolean } => {
      let foundValue = false;

      if (this.origineDemandes && group.value) {
        this.origineDemandes.forEach((origineDemande) => {
          if (origineDemande.id === group.value.id) {
            foundValue = true;
          }
        });
      }

      if (group.pristine) {
        return null;
      }
      if (!foundValue && group.value) {
        return { 'origineDemandeNotFound': true };
      }

      return null;
    };
  }

  /**
  * Manages how an Origine Demande should be displayed in the input
  * @param origineDemande a given origineDemande to be formatted
  */
  displayOrigineDemande(origineDemande: OrigineDemande) {
    if (origineDemande) {
      return `${origineDemande.libelle}`;
    }
  }

  /**
   * Manages how Origine Demandes are filtered upon user input
   * @param value user input
   */
  filterOrigineDemandes(value: string) {
    return this.origineDemandes.filter(origineDemande => {
      let result = false;
      if (value.length < 3) {
        return (origineDemande.code.toLowerCase().search(value.toString().toLowerCase()) === 0)
      }
      origineDemande.libelle.toLowerCase().split(' ').forEach(word => {
        if (word.search(value.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (origineDemande.code.toLowerCase().search(value.toString().toLowerCase()) === 0) || result;
    });
  }

  /**
   * Open popup of refuse dossier
   */
  refuserDossier() {
    const matDialogRef = this.openRefuseDossierDialog();

    matDialogRef.beforeClose()
      .subscribe(
        (result: boolean) => {
          // Dossier succesfully refused
          if (result) {
            // Update the phase displayed in the form
            this.formUpdateDossier.get('phase').setValue(this.dossierService.dossier.phase);
            // Disable the form
            this.formUpdateDossier.disable();
            this.displayTooltipRefus(this.dossierService.dossier.refusDossier)

          }
        });

    matDialogRef.afterClosed()
      .subscribe(() => {
        fixButtonRippleEffectBug(this.button as any);

      });
  }

  /**
   * Configures Material Dialog of refuse dossier
   */
  openRefuseDossierDialog(): MatDialogRef<RefuseDossierPopupComponent> {
    const config = new MatDialogConfig();
    config.width = '500px';
    // config.height = 'auto';
    config.disableClose = true;
    config.autoFocus = false;
    config.data = this.dossierService.dossier;
    return this.dialog.open(RefuseDossierPopupComponent, config);
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
    if (!this.formUpdateDossier.pristine && !this.submitted) {
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

    // Merge objects
    const dossierToUpdate: Dossier = Object.assign(this.dossierService.dossier, this.formUpdateDossier.value);

    this.dossierService.updateDossier(dossierToUpdate)
      .subscribe(
        () => {
          this.submitted = false;
          this._snackbar.open(`Le dossier ${this.dossierService.dossier.numeroDossier} a bien été modifié.`, 'X', snackbarConfigSuccess);
          // Update the dossier in the service
          this.dossierService.dossier = dossierToUpdate;
          // Reset the form to pristine
          fixIE11FormBug(this.formUpdateDossier);
        },
        (error: any) => {
          const snackBarAction =
            this._snackbar.open(`La modification du dossier a échoué. Contacter l'administrateur.`, 'X', snackbarConfigError);
          this.snackbarSubscription = snackBarAction.afterDismissed()
            .subscribe(() => {
              console.error(error);
              this.submitted = false;
            });
        });
  }

  reactiverDossier() {
    this.dossierService.reactiverDossier(this.dossierService.dossier.id)
      .subscribe((dossier) => {
        // Done this way to pass through the service setter and trigger the subject
        const dossierReactivated = dossier;
        dossierReactivated.phase = 'P00';
        this.dossierService.dossier = dossierReactivated;

        this.updateFormData(dossierReactivated);
        this.formUpdateDossier.enable();
        this.formUpdateDossier.get('benef_libelle').disable();
        this.formUpdateDossier.get('phase').disable();
        this.formUpdateDossier.get('numero_aid').disable();
      });
  }

  /**
  * Get information for refuse tooltip
  */
  displayTooltipRefus(refusDossier) {
    if (refusDossier) {
      this.libelNature = 'Nature de refus :';
      this.nature = refusDossier.natureRefus.libelle;
      this.libelMotif = 'Motif  : ';
      this.motif = refusDossier.motifRefus;
    }
  }

  close() {
    this._router.navigate(['recherche']);
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
