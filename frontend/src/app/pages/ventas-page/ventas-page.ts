import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ProductsService } from '../../core/services/products.service';
import { SalesService } from '../../core/services/sales.service';
import { CarritoService } from '../../core/services/carrito.service';
import { Product } from '../../core/models/product';

@Component({
  selector: 'app-ventas-page',
  standalone: true,
  imports: [FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatSnackBarModule, MatDividerModule],
  templateUrl: './ventas-page.html',
  styleUrl: './ventas-page.scss',
})
export class VentasPage {
  private products = inject(ProductsService);
  private sales = inject(SalesService);
  carrito = inject(CarritoService);
  private snack = inject(MatSnackBar);

  lista = signal<Product[]>([]);
  busqueda = signal('');
  medioPago = signal('efectivo');
  vendedor = signal('');
  cobrando = signal(false);
  ultimoFolio = signal('');

  fmt = (v: number) => this.sales.formatoCLP(v);

  constructor() { this.cargar(); }

  cargar() {
    this.products.listar('', this.busqueda()).subscribe({ next: (d) => this.lista.set(d) });
  }

  cobrar() {
    if (this.carrito.lineas().length === 0) return;
    this.cobrando.set(true);
    this.sales.crear(
      this.medioPago(),
      this.vendedor(),
      this.carrito.lineas().map(l => ({ product_id: l.product_id, cantidad: l.cantidad }))
    ).subscribe({
      next: (boleta) => {
        this.cobrando.set(false);
        this.ultimoFolio.set(boleta.folio);
        this.snack.open(`Venta ${boleta.folio} por ${this.fmt(boleta.total)} ✓`, 'Ver boletas', { duration: 4000 });
        this.carrito.limpiar();
        this.cargar(); // refresca stock
      },
      error: (e) => {
        this.cobrando.set(false);
        this.snack.open(e.error?.error || 'Error al cobrar', 'OK', { duration: 3500 });
      },
    });
  }
}
