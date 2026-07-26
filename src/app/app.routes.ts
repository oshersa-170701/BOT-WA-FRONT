import { Routes } from '@angular/router';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [authGuard] // Protegido
  },
  {
    path: 'dashboard/products',
    loadComponent: () => import('./dashboard/products/products.page').then(m => m.ProductsPage),
    canActivate: [authGuard] // Protegido
  },
  {
    path: 'dashboard/settings',
    loadComponent: () => import('./dashboard/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [authGuard] // Protegido
  },
  {
    path: 'dashboard/quotes',
    loadComponent: () => import('./dashboard/quotes/quotes.page').then( m => m.QuotesPage),
    canActivate: [authGuard] // Protegido
  },
  {
    path: 'dashboard/leads',
    loadComponent: () => import('./dashboard/leads/leads.page').then( m => m.LeadsPage),
    canActivate: [authGuard] // Protegido
  }
];