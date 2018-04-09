export const PAGES_MENU = [
  {
    path: '',
    children: [
      {
        path: 'accueil',
        data: {
          menu: {
            title: 'general.menu.dossiers.accueil',
            icon: 'ion-grid',
            selected: false,
            expanded: false,
            order: 600,
          }
        }
      },
      {
        path: '',
        data: {
          menu: {
            title: 'general.menu.dossiers.title',
            icon: 'ion-ios-list-outline',
            selected: false,
            expanded: false,
            order: 600,
          }
        },
        children: [
          {
            path: 'creation',
            data: {
              menu: {
                title: 'general.menu.dossiers.new',
                icon: 'ion-plus',
                selected: false,
                expanded: false,
                order: 600,
              }
            },
          },
          {
            path: 'update',
            data: {
              menu: {
                title: 'general.menu.dossiers.update',
                hidden: true
              }
            }
          },
          {
            path: 'dossier',
            data: {
              menu: {
                title: 'general.menu.dossiers.dossier',
                hidden: true,
                pathMatch: 'prefix',
                showingParent: true,
              }
            }
          },
          {
            path: 'recherche',
            data: {
              menu: {
                title: 'general.menu.dossiers.search',
                icon: 'ion-search',
                selected: false,
                expanded: false,
                order: 600,
              }
            }
          }
        ]
      }
    ]
  }
];
