import { Component, OnInit, Inject, Optional } from '@angular/core';
import { MatDialogRef, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { NgStyle } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { startWith } from 'rxjs/operators/startWith';

import { NatureRefus, RefusDossier } from '../refuse-dossier-popup/refuse-dossier-popup.interface';
import { Dossier } from '../dossiers.interface';

import { DossierService, ComponentViewRightMode } from './../dossiers.service';

/**
 * Component that refuse Dossier
 */
@Component({
  templateUrl: './refuse-dossier-popup.component.html',
  styleUrls: ['./refuse-dossier-popup.component.scss'],
})
export class RefuseDossierPopupComponent extends ComponentViewRightMode implements OnInit {

  /**
   * The object reprensenting the refus Dossier
   */
  formRefus: FormGroup;

  /**
   * List of possible nature of refuse
   */
  natures: NatureRefus[] = null;

  /**
   * Filtered naturesRefus depending on the user input
   */
  filteredNatures: Observable<NatureRefus[]>;

  /**
   * If the length of the searched input is above this number we search it also on the libelle
   */
  minSearchLength = 3

  /**
  * Component dependencies
  * @param _formBuilder used to create the form
  * @param _snackbar message that confirm the refuse of dossier
  * @param dialogRef used to display the popup
  * @param dossierService used to manage dossiers
  */
  constructor(
    private _formBuilder: FormBuilder,
    private _snackbar: MatSnackBar,
    public dialogRef: MatDialogRef<RefuseDossierPopupComponent>,
    public dossierService: DossierService
  ) {
    super(dossierService);
  }

  /**
   * Initializes the form and the specific inputs
   */
  ngOnInit() {
    // Init empty object instead of null for the form
    const refusDossier = this.dossierService.dossier.refusDossier;
    if (!refusDossier) {
      this.dossierService.dossier.refusDossier = {
        motifRefus: '',
        natureRefus: null
      };
    }

    this.formRefus = this._formBuilder.group({
      nature: [this.viewRight ? this.dossierService.dossier.refusDossier.natureRefus : '', [Validators.required, this.natureValidator()]],
      motif: [this.viewRight ? this.dossierService.dossier.refusDossier.motifRefus : '', [Validators.required, Validators.maxLength(240)]]
    });
    if (this.viewRight) {
      this.formRefus.disable();
    }

    this.dossierService.getNatureRefus()
      .subscribe(natures => {
        this.natures = natures;
        // Allow auto-complete filtering
        this.filteredNatures = this.formRefus.get('nature').valueChanges.pipe(
          startWith(''),
          map(value => value ? this.filterNatures(value) : this.natures.slice())
        );
      });
  }

  /**
  * Manages how natures are filtered upon user input
  * @param value user input
  * TODO : Simplify
  */
  filterNatures(value: string) {
    return this.natures.filter(nature => {
      let result = false;
      if (value.length < this.minSearchLength) {
        return (nature.code.toLowerCase().search(value.toString().toLowerCase()) === 0)
      }
      nature.libelle.toLowerCase().split(' ').forEach(word => {
        if (word.search(value.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (nature.code.toLowerCase().search(value.toString().toLowerCase()) === 0) || result;
    });
  }


  /**
  * Custom validator for natures
  */
  natureValidator() {
    return (group: FormGroup): { [key: string]: any } => {
      let foundValue = false;

      if (this.natures) {
        this.natures.forEach((nature) => {
          if (nature.libelle === group.value.libelle) {
            foundValue = true;
          }
        });
      }

      if (!foundValue && group.value) {
        return { 'natureNotFound': true };
      }

      return null;
    };
  }

  /**
  * Manages how a nature should be displayed in the input
  * @param nature a given nature to be formatted
  */
  displayNature(nature: NatureRefus) {
    if (nature) {
      return `${nature.libelle}`;
    }
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  /**
  * Add line on key Enter
  * @param $event event
  * @param oField textAreaText
  * TODO : Add event type
  */
  addLine($event: any, oField: any) {
    if (oField.selectionStart || oField.selectionStart === '0') {
      if ($event.keyCode === 13) {
        const content = this.formRefus.get('motif').value as string;
        this.formRefus.get('motif').setValue(content.substring(0, oField.selectionStart) + '\n' +
          content.substring(oField.selectionStart, content.length));
      }
    }
  }

  onSubmit() {
    const refusDossier: RefusDossier = {
      motifRefus: (this.formRefus.get('motif').value as string),
      natureRefus: (this.formRefus.get('nature').value as NatureRefus)
    };

    this.dossierService.refuseDossier(this.dossierService.dossier.id, refusDossier)
      .subscribe((dossier) => {
        // Done this way to pass through the service setter and trigger the subject
        const dossierRefused = this.dossierService.dossier;
        dossierRefused.refusDossier = refusDossier;
        dossierRefused.phase = 'T40';
        this.dossierService.dossier = dossierRefused;
        this.dialogRef.close(true);
      },
        (error: any) => {
          const snackbarConfig: MatSnackBarConfig = {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
          };
          this._snackbar.open(`Le refus du dossier a échoué.`, 'X', snackbarConfig);
        });
  }
}
