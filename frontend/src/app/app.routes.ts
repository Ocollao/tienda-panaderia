import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalog-page/catalog-page').then(m => m.CatalogPage),
    title: 'Catálogo | Panadería',
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventory-page/inventory-page').then(m => m.InventoryPage),
    title: 'Inventario | Panadería',
  },
  { path: '**', redirectTo: 'catalogo' },
];
