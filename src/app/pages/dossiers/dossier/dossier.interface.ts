import { ListValeur, DossierBase } from '../dossiers.interface';
import { RefusDossier } from '../refuse-dossier-popup/refuse-dossier-popup.interface';

export interface DossierUpdate extends DossierBase {
  phase: string;
  dateDemande?: Date
  origineDemande?: OrigineDemande
}

export interface SessionDecision {
  annee: number,
  id: number,
  numero: number,
  type: string
}

export interface OrigineDemande extends ListValeur {

}

export interface NiveauPriorite extends ListValeur {
}
