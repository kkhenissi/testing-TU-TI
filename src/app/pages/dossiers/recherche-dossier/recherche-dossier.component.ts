import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, PageEvent, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { LocalDataSource } from 'ng2-smart-table';

import { Settings, Critere } from './recherche-dossier.interface';
import { Dossier } from '../dossiers.interface';
import { Thematique, Departement, ResponsableTechnique } from '../create-dossier/create-dossier.interface';
import { snackbarConfigError } from 'app/shared/shared.interface';

import { DossierService } from '../dossiers.service';
import { Title } from '@angular/platform-browser';


/**
 * Allows the search of a dossier with criterias
*/
@Component({
  selector: 'siga-search-table',
  templateUrl: './recherche-dossier.component.html',
  styleUrls: ['./recherche-dossier.component.scss']
})
export class RechercheDossierComponent implements OnInit, OnDestroy {
  // data: any;
  somme = { totalsForcastAmounts: 0, totalsAmountsAid: 0 };
  /**
  * Source to be displayed in the table
  */
  source: LocalDataSource = new LocalDataSource();
  sourceTotals: LocalDataSource = new LocalDataSource();
  query = '';

  /**
   * Define structure of table (column and style)
   */
  settings: Settings = {
    actions: false,
    hideSubHeader: true,
    columns: {
      numeroDossier: {
        title: 'Numéro dossier',
        type: 'txt',
        filter: false,
        width: '130px'
      },
      intitule: {
        title: 'Intitulé',
        type: 'txt',
        filter: false,
        width: '420px'
      },
      beneficiaire: {
        title: 'Bénéficiaire',
        type: 'txt',
        filter: false,
        width: '420px',
        valuePrepareFunction: (cell: any, row: any) => {
          return `${row.beneficiaire.reference} - ${row.beneficiaire.raisonSociale}`
        }
      }
    },
    pager: {
      display: false
    }
  };

  /**
   * Define structure of table (column and style)
   */
  settingsAmounts = {
    actions: {
      position: 'right',
      width: '50%'
    },
    columns: {
      id: {
        title: 'ID Dossier',
        editable: false,
        filter: false
      },
      forcastAmount: {
        title: 'Montant travaux Prévisionnel',
        filter: false
      },
      amount: {
        title: 'Montant aide',
        filter: false
      },
    }
  };
  /**
   * Define structure of table (one Row totals)
   */
  settingsTotals = {
    hideHeader: true,
    actions: false,
    hideSubHeader: true,
    hideSubfooter: true,
    noDataMessage: '',
    columns: {
      totalsForcastAmounts: {
        position: 'left',
        title: 'Total travaux Prévisionnel ',
        filter: false,
        width: '50%'
      },
      totalsAmountsAid: {
        position: 'right',
        title: 'Total aide  prévisionnel',
        filter: false,
        width: '50%'
      }
    }
  };

  data = [
    {
      id: 1,
      forcastAmount: '23000',
      amount: '19000',
    },
    {
      id: 2,
      forcastAmount: '18000',
      amount: '14000'
    },
    {
      id: 11,
      forcastAmount: '32000',
      amount: '25000',
    }
  ];
  totalsSource = [
    {
      totalsForcastAmounts: '23000',
      totalsAmountsAid: '18000'
    }
  ];

  /**
   * Configuration actuelle
   */
  currentCriteres: Critere

  /**
   * List of dossiers
   */
  dossiersDatas: Dossier[];

  /**
   * Total number of elements in search
   */
  nbTotalElements: number;

  /**
   * Maximal number elements per page
   */
  pageSize = 15;

  /**
   * List of values that could been taken by number elements
   */
  pageSizeOption = [15, 30, 50];

  /**
   * Displays the table once a result is available
   */
  searchDone = false;

  indexCurrentPage;

  thematiques: Thematique[] = [];
  depts: Departement[]

  /**
  * List of responsables techniques
  */
  responsablesTech: ResponsableTechnique[];

  /**
   * Component dependencies
   * @param _dossierService used to manage dossiers
   * @param _snackBar used to display snackbars
   * @param router handle manual navigation
   */
  constructor(
    private _dossierService: DossierService,
    private _snackBar: MatSnackBar,
    public router: Router
  ) { }

  /**
 * Initialize the specific inputs
 */
  ngOnInit() {
    this._dossierService.getThematiques()
      .subscribe(thematiques => {
        this.thematiques = thematiques;
      });

    this._dossierService.getDepts()
      .subscribe(depts => {
        this.depts = depts;
      });

    this._dossierService.getResponsableTech()
      .subscribe(responsablestech => {
        this.responsablesTech = responsablestech;
      });
  }

  /**
   * get the corresponding dossiers for the search
   * @param criteresRecherche Object containing the various parameters by which done the search
   */
  fetchResultatRecherche(criteresRecherche: Critere) {
    this.currentCriteres = criteresRecherche;
    this.currentCriteres.nbElemPerPage = this.pageSize;

    this._dossierService.getResultatRecherche(criteresRecherche)
      .subscribe(
        (data) => {
          this.dossiersDatas = data.dossiers;
          this.nbTotalElements = data.nombreTotalElements;
          this.pageSize = data.nombreElementsParPage;
          this.indexCurrentPage = data.numeroPageCourante;
          this.loadDataSource();
        },
        (error: any) => {
          this._snackBar.open(error.error.sigaapierreur.message, 'X', snackbarConfigError);
        });
  }

  /**
   *Load the data in the results table
   */
  loadDataSource(): void {
    this.source.load(this.dossiersDatas);
    // this.source.setSort([{ field: 'numeroDossier', direction: 'asc' }]);
    this.searchDone = true;
  }

  /**
   * On row click
   * @param row row clicked
   * TODO : Add row type
   */
  onDossierSelect(row: any) {
    // Redirect to update dossier
    this.router.navigate([`dossier/${row.data.id}`]);
  }

  /**
   * Manages the user selection for a given row
   * @param row the row selected with its data
   */
  onTableRowClick(row: any) {
    // Redirect to update dossier
    this.router.navigate([`dossier/${row.data.id}`]);
  }

  /**
   * Récupérer le numéro de la page courante
   * @param event Evenement émis par le paginateur, contiens le nombre d'éléments par page et le numéro index de la page courante.
   */
  getNumberPage(event: PageEvent) {
    this.currentCriteres.pageAAficher = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchResultatRecherche(this.currentCriteres);
  }

  /**
  * Destroys pending subscriptions
  */
  ngOnDestroy() {
  }

  /**
   * temporary to migreted on dossier component
   */
  onDeleteConfirm(event): void {
    event.confirm.resolve();
  }

  create(event): void {
    event.confirm.resolve();
    this.somme.totalsForcastAmounts += parseInt(event.newData.forcastAmount);
    this.somme.totalsAmountsAid += parseInt(event.newData.amount);
    this.sourceTotals.load([{ totalsForcastAmounts: this.somme.totalsForcastAmounts, totalsAmounts: this.somme.totalsAmountsAid }]);
  }

  update(event): void {
    // this.somme.totalsForcastAmounts -= this.SelectedRow.forcastAmount;
    // this.somme.totalsAmounts -= this.SelectedRow.amount;
    // this.somme.totalsForcastAmounts += event.newData.forcastAmount;
    // this.somme.totalsAmounts += event.newData.amount;
    event.confirm.resolve();
  }

  edit(event): void {
    // this.SelectedRow = event.data;

  }

  initSommeTable() {
    for (let i = 0; i < this.data.length; i++) {
      this.somme.totalsForcastAmounts += parseInt(this.data[i].forcastAmount);
      this.somme.totalsAmountsAid += parseInt(this.data[i].amount);
    }
  }

}

