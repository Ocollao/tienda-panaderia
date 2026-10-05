import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product';
import { ProductDialog } from './product-dialog';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './inventory-page.html',
  styleUrl: './inventory-page.scss',
})
export class InventoryPage {
  private api = inject(ProductsService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  productos = signal<Product[]>([]);
  cargando = signal(true);
  soloBajo = signal(false);
  bajoTotal = signal(0);
  columnas = ['id', 'nombre', 'categoria', 'precio', 'stock', 'acciones'];

  precio = (v: number) => this.api.formatoCLP(v);

  filtrados() {
    if (!this.soloBajo()) return this.productos();
    return this.productos().filter((p) => p.stock_bajo);
  }

  constructor() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: (d) => {
        this.productos.set(d);
        this.bajoTotal.set(d.filter((p) => p.stock_bajo).length);
        this.cargando.set(false);
      },
      error: () => { this.cargando.set(false); this.snack.open('No se pudo conectar con Flask :5000', 'OK', { duration: 3000 }); },
    });
  }

  reponer(p: Product) {
    // Suma rapida +10 al stock bajo, sin abrir el dialogo
    this.api.actualizar(p.id, { stock: p.stock + 10 }).subscribe({
      next: () => { this.snack.open(`${p.nombre} +10 al stock ✓`, 'OK', { duration: 2000 }); this.cargar(); },
      error: () => this.snack.open('No se pudo reponer', 'OK', { duration: 2500 }),
    });
  }

  nuevo() {
    const ref = this.dialog.open(ProductDialog, { width: '420px', data: null });
    ref.afterClosed().subscribe((res) => { if (res) this.cargar(); });
  }

  editar(p: Product) {
    const ref = this.dialog.open(ProductDialog, { width: '420px', data: { ...p } });
    ref.afterClosed().subscribe((res) => { if (res) this.cargar(); });
  }

  eliminar(p: Product) {
    if (!confirm(`¿Eliminar "${p.nombre}" del inventario?`)) return;
    this.api.eliminar(p.id).subscribe({
      next: () => { this.snack.open('Producto eliminado', 'OK', { duration: 2000 }); this.cargar(); },
      error: () => this.snack.open('Error al eliminar', 'OK', { duration: 2000 }),
    });
  }
}
