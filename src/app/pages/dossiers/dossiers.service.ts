import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Dossier } from './dossiers.interface';
import { Thematique, Departement, DossierCreate, Beneficiaire, ResponsableTechnique } from './create-dossier/create-dossier.interface';
import { DossierUpdate, OrigineDemande, NiveauPriorite, SessionDecision } from './dossier/dossier.interface';
import { NatureRefus, RefusDossier } from './refuse-dossier-popup/refuse-dossier-popup.interface';
import { Critere } from './recherche-dossier/recherche-dossier.interface';

import { AppService } from 'app/app.service';
import { GlobalState } from 'app/global.state';

@Injectable()
export class DossierService {
  private _customHeaders: HttpHeaders = null;
  private _dossier: Dossier = null;
  private _currentDossierId: number = null;
  private _dossierPhaseSubject: Subject<boolean>;

  tempDossierURL = '/assets/mock/dossier.json';
  tempThematiquesURL = '/assets/mock/thematiques.json';
  tempDeptsURL = '/assets/mock/depts.json';
  tempNaturesURL = '/assets/mock/natureRefus.json';

  public dossierPhase$: Observable<boolean>;

  constructor(
    private _httpClient: HttpClient,
    private _appService: AppService,
    private _state: GlobalState
  ) {
    // Initialize phase subject
    this._dossierPhaseSubject = new Subject<boolean>();
    this.dossierPhase$ = this._dossierPhaseSubject.asObservable();

    this.setCustomHeaders();
  }

  /**
   * Correction bug IE pour les méthodes GET sur même domaine
   */
  setCustomHeaders() {
    this._customHeaders = new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    });
  }

  /**
   * The whole dossier object currently used
   */
  get dossier() {
    return this._dossier;
  }
  set dossier(value: Dossier) {
    this._dossier = value;

    /**
     * Propagate change to GlobalState to display on Breadcrumb
     * TODO : Improve ?
     */
    this._state.dossier = value;

    /**
     * Improve when dossier needs to be reactivated
     */
    this.isPhaseT40();
  }

  getThematiques(): Observable<Thematique[]> {
    const url = `${this._appService.environment.BACKEND}/valeur/thematique`;
    return this._httpClient.get<Thematique[]>(url, { headers: this._customHeaders });
  }

  createDossier(dossier: DossierCreate) {
    const url = `${this._appService.environment.BACKEND}/dossier`;
    return this._httpClient.post<Dossier>(url, dossier);
  }

  getDepts(): Observable<Departement[]> {
    const tempLocalAssets = '/assets/mock/depts.json'
    // const url = `${this.appService.environment.BACKEND}/dossier`;
    return this._httpClient.get<Departement[]>(`${tempLocalAssets}`);
  }

  getResponsableTech(): Observable<ResponsableTechnique[]> {
    const url = `${this._appService.environment.BACKEND}/utilisateur`;
    return this._httpClient.get<ResponsableTechnique[]>(url, { headers: this._customHeaders })
  }

  getNatureRefus(): Observable<NatureRefus[]> {
    const url = `${this._appService.environment.BACKEND}/valeur/natureRefus`;
    return this._httpClient.get<NatureRefus[]>(url, { headers: this._customHeaders });
  }

  getOrigineDemande(): Observable<OrigineDemande[]> {
    const url = `${this._appService.environment.BACKEND}/valeur/origineDemande`;
    return this._httpClient.get<OrigineDemande[]>(url, { headers: this._customHeaders });
  }

  getDossier(idDossier: number) {
    const url = `${this._appService.environment.BACKEND}/dossier/${idDossier}`;
    return this._httpClient.get<Dossier>(url, { headers: this._customHeaders });
  }

  updateDossier(dossier: Dossier) {
    const url = `${this._appService.environment.BACKEND}/dossier`;
    return this._httpClient.put<Dossier>(url, dossier);
  }

  refuseDossier(idDossier: number, refusDossier: RefusDossier) {
    const url = `${this._appService.environment.BACKEND}/dossier/refus/${idDossier}`;
    return this._httpClient.put<Dossier>(url, refusDossier);
  }

  reactiverDossier(idDossier: number) {
    const url = `${this._appService.environment.BACKEND}/dossier/reactiver/${idDossier}`;
    return this._httpClient.put<Dossier>(url, {});
  }

  /**
   * Get the list of Dossiers depending on the different criterias
   * @param criteresRecherche criterias set in input
   */
  getResultatRecherche(criteresRecherche: Critere): Observable<any> {
    let requestUrl = '/dossier?';
    let modified = false;

    // thematique
    if (criteresRecherche.thematique != null) {
      requestUrl += 'idThematique=' + criteresRecherche.thematique;
      modified = true;
    }

    // departement
    if (criteresRecherche.departement != null) {
      if (modified === true) {
        requestUrl += '&'
      }
      requestUrl += 'departement=' + criteresRecherche.departement;
      modified = true;
    }

    // responsable technique
    if (criteresRecherche.responsableTech != null) {
      if (modified === true) {
        requestUrl += '&'
      }
      requestUrl += 'idResponsableTechnique=' + criteresRecherche.responsableTech;
      modified = true;
    }

    // beneficiaire
    if (criteresRecherche.codeBenef != null) {
      if (modified === true) {
        requestUrl += '&'
      }
      requestUrl += 'numeroBeneficiaire=' + criteresRecherche.codeBenef;
      modified = true;
    }

    // numéro d'ordre
    if (criteresRecherche.numeroIncrement != null) {
      if (modified === true) {
        requestUrl += '&'
      }
      requestUrl += 'numeroOrdre=' + criteresRecherche.numeroIncrement;
      modified = true;
    }

    // page à afficher
    if (criteresRecherche.pageAAficher != null) {
      if (modified === true) {
        requestUrl += '&'
      }
      requestUrl += 'numeroPage=' + criteresRecherche.pageAAficher;
      modified = true;
    }

    // nombre élément par page
    if (criteresRecherche.nbElemPerPage != null) {
      if (modified === true) {
        requestUrl += '&'
      }
      requestUrl += 'nombreElementPage=' + criteresRecherche.nbElemPerPage;
      modified = true;
    }

    return this._httpClient.get<Dossier>(`${this._appService.environment.BACKEND}${requestUrl}`, { headers: this._customHeaders });
  }

  getBeneficaire(reference: string): Observable<Beneficiaire> {
    const url = `${this._appService.environment.BACKEND}/interlocuteur/${reference}`;
    return this._httpClient.get<Beneficiaire>(url, { headers: this._customHeaders });
  }

  getNiveauPriorite(): Observable<NiveauPriorite[]> {
    const url = `${this._appService.environment.BACKEND}/valeur/niveauPriorite`;
    return this._httpClient.get<NiveauPriorite[]>(url, { headers: this._customHeaders });
  }

  getSessionDecision(): Observable<SessionDecision[]> {
    const url = `${this._appService.environment.BACKEND}/valeur/sessionDecision`;
    return this._httpClient.get<SessionDecision[]>(url, { headers: this._customHeaders });
  }

  /**
   * Checks the phase of the current dossier
   */
  isPhaseT40(): void {
    if (this.dossier && this.dossier.phase === 'T40') {
      return this._dossierPhaseSubject.next(true);
    }
    return this._dossierPhaseSubject.next(false);
  }
}

/**
 * Manages the read / write mode on components depending on the phase of a given dossier
 * TODO : Move elsewhere later on
 */
export class ComponentViewRightMode implements OnDestroy {

  /**
  * Mode Read or Right
  */
  viewRight: boolean;

  /**
  * used to manage dossiers
  */
  private _dossierServiceReference: DossierService;

  /**
  *  subscription on dossier phase
  */
  private _dossierServiceSubscription: Subscription;

  constructor(
    dossierService: DossierService,
  ) {
    this._dossierServiceReference = dossierService;

    // Updates the phase when the dossier is updated
    this._dossierServiceSubscription = this._dossierServiceReference.dossierPhase$
      .subscribe(phaseUpdated => {
        this.viewRight = phaseUpdated;
      });

    // Initializes with the current viewRight depending on the phase
    this.viewRight = this._dossierServiceReference.dossier && (this._dossierServiceReference.dossier.phase === 'T40') ? true : false;
  }

  /**
   * Destroys pending subscriptions
   */
  ngOnDestroy() {
    if (this._dossierServiceSubscription) {
      this._dossierServiceSubscription.unsubscribe();
    }
  }
}
