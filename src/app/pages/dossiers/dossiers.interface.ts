
import { DossierCreate } from '../dossiers/create-dossier/create-dossier.interface'
import { RefusDossier } from './refuse-dossier-popup/refuse-dossier-popup.interface';
import { DossierUpdate, NiveauPriorite, SessionDecision } from './dossier/dossier.interface';

export interface DossierBase {
  intitule: string;
}

export interface Interlocuteur {
  id?: string;
  reference: string;
  raisonSociale: string;
  actif: boolean;
}

/**
 * TODO : Consolidate with types
 */
export interface Dossier extends DossierCreate, DossierUpdate {
  id: number;
  noOrdre: number;
  noOrdreFormate: string;
  numeroDossier: string;
  refusDossier: RefusDossier;
  referenceBenef: string;
  preDossier: PreDossier;
  numero_aid: string;
}

export interface PreDossier {
  anneeEngagPrevi: number,
  niveauPriorite: NiveauPriorite,
  sessionDecision: SessionDecision
}

export interface ListValeur {
  id: number;
  libelle: string;
  code: string;
  codeParam?: string;
  libelleParam?: string;
}

interface Beneficiaire {
  reference: string;
}

export const IncrementRegex: RegExp = /^(\d){5}$/;
export const BenefRegex: RegExp = /^(\d){8}([A-Za-z])$/;
export const FrenchDateRegex: RegExp = /^(([1-2]\d|0[1-9]|[3][0-1])\/([0][1-9]|[1][0-2])\/[2][0-9]\d{2})/;
