import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ProductsService } from '../../core/services/products.service';
import { Product, CATEGORIAS } from '../../core/models/product';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatChipsModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  private api = inject(ProductsService);

  productos = signal<Product[]>([]);
  cargando = signal(true);
  busqueda = signal('');
  categoria = signal('');

  categorias = CATEGORIAS;
  apiFoto = (p: Product) => this.api.fotoCompleta(p.foto_url);
  precio = (p: Product) => this.api.formatoCLP(p.precio);

  filtrados = computed(() => this.productos());

  constructor() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.listar(this.categoria(), this.busqueda()).subscribe({
      next: (data) => { this.productos.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  etiqueta(cat: string): string {
    return cat === 'panaderia' ? 'Panadería' : cat === 'pasteleria' ? 'Pastelería' : 'Minimarket';
  }
}
