import { Routes } from '@angular/router';
import { authGuard, duenoGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page').then(m => m.LoginPage),
    title: 'Entrar | Panadería',
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./pages/catalog-page/catalog-page').then(m => m.CatalogPage),
    title: 'Catálogo | Panadería',
    canActivate: [authGuard],
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventory-page/inventory-page').then(m => m.InventoryPage),
    title: 'Inventario | Panadería',
    canActivate: [authGuard],
  },
  {
    path: 'ventas',
    loadComponent: () => import('./pages/ventas-page/ventas-page').then(m => m.VentasPage),
    title: 'Ventas | Panadería',
    canActivate: [authGuard],
  },
  {
    path: 'boletas',
    loadComponent: () => import('./pages/boletas-page/boletas-page').then(m => m.BoletasPage),
    title: 'Boletas | Panadería',
    canActivate: [authGuard],
  },
  {
    path: 'gastos',
    loadComponent: () => import('./pages/gastos-page/gastos-page').then(m => m.GastosPage),
    title: 'Gastos | Panadería',
    canActivate: [authGuard, duenoGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage),
    title: 'Dashboard | Panadería',
    canActivate: [authGuard, duenoGuard],
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/usuarios-page/usuarios-page').then(m => m.UsuariosPage),
    title: 'Usuarios | Panadería',
    canActivate: [authGuard, duenoGuard],
  },
  { path: '**', redirectTo: 'catalogo' },
];
