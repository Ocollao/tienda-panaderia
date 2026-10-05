import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from './core/services/auth.service';
import { ProductsService } from './core/services/products.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  titulo = 'La Espiga · Panadería & Minimarket v0.4.1';
  auth = inject(AuthService);
  private products = inject(ProductsService);
  private router = inject(Router);

  stockBajo = signal(0);

  constructor() {
    // Avisa el stock bajo en el menu cuando hay sesion
    setInterval(() => {
      if (!this.auth.logeado()) return;
      this.products.stockBajo().subscribe({ next: (r) => this.stockBajo.set(r.total) });
    }, 60000);
    // Primera carga diferida para no pelear con el login
    setTimeout(() => {
      if (this.auth.logeado()) {
        this.products.stockBajo().subscribe({ next: (r) => this.stockBajo.set(r.total) });
      }
    }, 2000);
  }

  salir() {
    this.auth.salir();
    this.stockBajo.set(0);
    this.router.navigateByUrl('/login');
  }
}
