import { ListValeur } from '../dossiers.interface';

export interface RefusDossier {
  id?: number;
  motifRefus: string;
  natureRefus: NatureRefus;
}

export interface NatureRefus extends ListValeur {

}
