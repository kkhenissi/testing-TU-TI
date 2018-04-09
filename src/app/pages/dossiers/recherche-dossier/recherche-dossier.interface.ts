export interface Settings {
  actions?: boolean | Object;
  add?: Object;
  edit?: Object;
  delete?: Object;
  hideSubHeader?: boolean;
  mode?: string;
  columns: { [propName: string]: Object };
  selectMode?: string;
  pager?: any;
}

export interface Critere {
  thematique?: string; // id: thematique.id
  departement?: string; // id: dept.id
  responsableTech?: string // login du responsable technique
  numeroIncrement?: string // avec 5 chiffres
  codeBenef?: string // 8 chiffres et une lettre majuscule ex: 12345678A
  pageAAficher?: number; // numéro de la page a demander
  nbElemPerPage?: number; // nombre d'élément à afficher par page
}
