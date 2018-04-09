import { ListValeur, DossierBase, Interlocuteur } from '../dossiers.interface';

export interface DossierCreate extends DossierBase {
  thematique: Thematique;
  departement: string;
  beneficiaire: Beneficiaire;
  responsableTechnique: ResponsableTechnique
}

export interface ResponsableTechnique {
  login: string;
  prenom: string;
  nom: string;
}

// TODO : Voir pour un extend de ListValeur plus tard ??
// Impossible pour le moment => casse les tests puisque le champ 'id' n'est pas un number dans ce cas là
export interface Departement {
  id: string;
  libelle: string;
  code: string;
}

export interface Thematique extends ListValeur {

}

export interface Beneficiaire extends Interlocuteur {

}







