import { Component, OnInit, AfterViewInit, OnChanges, Input, Output, EventEmitter, SimpleChange } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Observable } from 'rxjs/Observable';
import { startWith, map } from 'rxjs/operators';
import * as _moment from 'moment';
import { Moment } from 'moment';
const moment = _moment;

import {
  fixIE11FormBug,
  datePickerConfig,
  filterListValeur,
  sigaAutocompleteValidatorFactory,
  minSearchLength
} from 'app/shared/shared.interface';

import { DossierService, ComponentViewRightMode } from '../../dossiers.service';
import { NiveauPriorite, SessionDecision } from '../dossier.interface';
import { Dossier, PreDossier } from '../../dossiers.interface';
import { MatAutocompleteSelectedEvent, MatInput } from '@angular/material';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
// TODO : Move elsewhere ?
const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
  },
};

@Component({
  selector: 'test',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class Test1Component extends ComponentViewRightMode implements OnInit, AfterViewInit, OnChanges {
  @Input() dossier: Dossier = null;

  /**
  * The object reprensenting the whole dossier to be created
  */
  formPrevisionnel: FormGroup;

  // TODO : Voir avec Myriam maxDate
  datePickerConfig = {
    minDate: datePickerConfig.minDate,
    maxDate: new Date(2050, 0, 1),
  };
  sessionType: string = null;

  priorites: NiveauPriorite[] = null;
  filteredPriorites: Observable<NiveauPriorite[]>;
  readonly prioriteValidatorKey = 'prioriteNotFound';
  get prioriteControl() { return this.formPrevisionnel.get('priorite'); }

  sessions: SessionDecision[] = null;
  filteredSessions: Observable<SessionDecision[]>;
  readonly sessionValidatorKey = 'sessionNotFound';
  get sessionControl() { return this.formPrevisionnel.get('session'); }

  get anneeControl() { return this.formPrevisionnel.get('annee'); }

  constructor(
    private _formBuilder: FormBuilder,
    private _dossierService: DossierService
  ) {
    super(_dossierService);

    _dossierService.dossierPhase$
      .subscribe(phase => {
        if (phase && this.formPrevisionnel) {
          this.formPrevisionnel.disable();
        } else {
          this.formPrevisionnel.enable();
        }
      });
  }

  ngOnInit() {
    this.formPrevisionnel = this._formBuilder.group({
      priorite: [null, [this.prioriteTempValidator()]],
      annee: [null, []],
      session: [null, [this.sessionsTempValidator()]],
    });

    this._dossierService.getNiveauPriorite()
      .subscribe(priorites => {
        this.priorites = priorites;
        // Set synchronous validator once the data is available
        // this.prioriteControl.setValidators([
        //   this.prioriteControl.validator,
        //   sigaAutocompleteValidatorFactory(this.priorites, this.prioriteValidatorKey)
        // ]);

        // Allow auto-complete filtering on priorites
        this.filteredPriorites = this.prioriteControl.valueChanges.pipe(
          startWith(''),
          map(value => (value && this.prioriteControl.hasError(this.prioriteValidatorKey)) ?
            filterListValeur(value, this.priorites, minSearchLength) : this.priorites.slice())
        );
      });

    this._dossierService.getSessionDecision()
      .subscribe(sessions => {
        this.sessionType = sessions[0].type;
        this.sessions = sessions;
        // Set synchronous validator once the data is available
        // this.sessionControl.setValidators([
        //   sigaAutocompleteValidatorFactory(this.sessions, this.sessionValidatorKey)
        // ]);

        // Allow auto-complete filtering on priorites
        this.filteredSessions = this.sessionControl.valueChanges.pipe(
          startWith(''),
          map(value => (value && this.sessionControl.hasError(this.sessionValidatorKey)) ?
            this.filterSessionDecision(value) : this.sessions.slice())
        );
      });
  }

  ngAfterViewInit() {
    fixIE11FormBug(this.formPrevisionnel);
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.dossier && changes.dossier.currentValue && (changes.dossier.currentValue as Dossier).preDossier && this.formPrevisionnel) {
      this.updateFormData(this._dossierService.dossier);

      if (this.viewRight) {
        this.formPrevisionnel.disable();
      }
    }
  }

  /**
  * Patches the values from the service in the form
  */
  updateFormData(dossier: Dossier) {
    if (dossier.preDossier) {
      this.formPrevisionnel.patchValue({
        priorite: dossier.preDossier.niveauPriorite,
        annee: moment().year(dossier.preDossier.anneeEngagPrevi),
        session: dossier.preDossier.sessionDecision
      });
    }
  }

  /**
   * Manages the binding between the year selector and the calendar
   * @param normalizedYear Year selected as a Moment
   * @param datepicker the linked datepicker reference
   */
  chosenYearHandler(normalizedYear: Moment, datepicker: MatDatepicker<Moment>) {
    let ctrlValue: Moment = this.anneeControl.value;

    // Manage default empty value
    if (!ctrlValue) {
      ctrlValue = moment();
    }

    // Reset the Session control value
    this.sessionControl.setValue(null);

    ctrlValue.year(normalizedYear.year());
    this.anneeControl.setValue(ctrlValue);
    // TEMP
    this.updateServiceValue();
    datepicker.close();
  }

  onAnneeInputChange(event: MatDatepickerInputEvent<Moment>) {
    // Reset the Session control value
    this.sessionControl.setValue(null);

    if (this.anneeControl.valid && this._dossierService.dossier) {
      this.updateServiceValue();
    }
  }

  // TEMP
  updateServiceValue() {
    const formattedPreDossier: PreDossier = {
      niveauPriorite: this.prioriteControl.value ? (this.prioriteControl.value as NiveauPriorite) : null,
      anneeEngagPrevi: this.anneeControl.value ? (this.anneeControl.value as Moment).year() : null,
      sessionDecision: this.sessionControl.value ? (this.sessionControl.value as SessionDecision) : null
    };
    this._dossierService.dossier.preDossier = formattedPreDossier;
  }

  /**
  * Manages how a priorite should be displayed in the input
  * @param priorite a given NiveauPriorite to be formatted
  */
  displayNiveauPriorite(priorite: NiveauPriorite) {
    if (priorite) {
      return `${priorite.code} - ${priorite.libelle}`;
    }
  }

  /**
  * Manages how a session should be displayed in the input
  * @param session a given SessionDecision to be formatted
  */
  displaySessionDecision(session: SessionDecision) {
    if (session) {
      return `${session.numero}`;
    }
  }

  /**
  * Manages how SessionDecisions are filtered upon user input
  * @param value user input
  */
  filterSessionDecision(value: string) {
    return this.sessions.filter(session => {
      let result = false;
      if (value.length < 3) {
        return (session.numero.toString().toLowerCase().search(value.toString().toLowerCase()) === 0)
      }
      session.annee.toString().toLowerCase().split(' ').forEach(word => {
        if (word.search(value.toString().toLowerCase()) === 0) {
          result = true;
        }
      });
      return (session.numero.toString().toLowerCase().search(value.toString().toLowerCase()) === 0) || result;
    });
  }

  /**
   * Triggers when a session has been selected
   * @param event the event containing the selected option
   * WARNING : Bug when displaying errors on the first time (not displayed => bug from material)
   */
  onSessionSelect(event: MatAutocompleteSelectedEvent) {
    const selectedYear = (event.option.value as SessionDecision).annee;
    const momentJSDateFormat = moment().year(selectedYear);
    this.anneeControl.setValue(momentJSDateFormat);
    this.updateServiceValue();
  }

  /**
 * Triggers when a session has been selected
 * @param event the event containing the selected option
 * WARNING : Bug when displaying errors on the first time (not displayed => bug from material)
 */
  onPrioSelect(event: MatAutocompleteSelectedEvent) {
    const prioriteSelected = (event.option.value as NiveauPriorite);
    this.prioriteControl.setValue(prioriteSelected);
    this.updateServiceValue();
  }

  /**
   * CHECK THESE JS REFERENCES !!
   */
  sessionsTempValidator() {
    return (group: any): { [key: string]: boolean } => {
      let foundValue = false;

      if (this.sessions && group.value) {
        this.sessions.forEach((origineDemande) => {
          if (origineDemande.id === group.value.id) {
            foundValue = true;
          }
        });
      }

      if (group.pristine) {
        return null;
      }
      if (!foundValue && group.value) {
        return { 'prioriteNotFound': true };
      }

      return null;
    };
  }

  prioriteTempValidator() {
    return (group: any): { [key: string]: boolean } => {
      let foundValue = false;

      if (this.priorites && group.value) {
        this.priorites.forEach((origineDemande) => {
          if (origineDemande.id === group.value.id) {
            foundValue = true;
          }
        });
      }

      if (group.pristine) {
        return null;
      }
      if (!foundValue && group.value) {
        return { 'sessionNotFound': true };
      }

      return null;
    };
  }
}
