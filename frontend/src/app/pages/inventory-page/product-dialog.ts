import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar producto' : 'Nuevo producto' }}</h2>
    <div mat-dialog-content class="form">
      <mat-form-field appearance="outline"><mat-label>Nombre *</mat-label>
        <input matInput [(ngModel)]="form.nombre" placeholder="Ej: Marraqueta kg" /></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Categoría *</mat-label>
        <mat-select [(ngModel)]="form.categoria">
          <mat-option value="panaderia">Panadería</mat-option>
          <mat-option value="pasteleria">Pastelería</mat-option>
          <mat-option value="minimarket">Minimarket</mat-option>
        </mat-select></mat-form-field>
      <div class="fila">
        <mat-form-field appearance="outline"><mat-label>Precio CLP *</mat-label>
          <input matInput type="number" [(ngModel)]="form.precio" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Stock *</mat-label>
          <input matInput type="number" [(ngModel)]="form.stock" /></mat-form-field>
      </div>
      <mat-form-field appearance="outline"><mat-label>Descripción</mat-label>
        <input matInput [(ngModel)]="form.descripcion" /></mat-form-field>
      <div class="fila">
        <input type="file" accept="image/*" (change)="elegirFoto($event)" />
        @if (subiendo()) { <small>Subiendo foto...</small> }
      </div>
      @if (form.foto_url) { <small class="ok">Foto lista ✓</small> }
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" (click)="guardar()" [disabled]="guardando()">Guardar</button>
    </div>
  `,
  styles: [`.form{display:flex;flex-direction:column;gap:8px;min-width:280px}.fila{display:flex;gap:8px}.fila>*{flex:1}.ok{color:green}`],
})
export class ProductDialog {
  private api = inject(ProductsService);
  private snack = inject(MatSnackBar);
  private ref = inject(MatDialogRef<ProductDialog>);
  private data: Product | null = inject(MAT_DIALOG_DATA);

  editando = !!this.data?.id;
  guardando = signal(false);
  subiendo = signal(false);
  form: Partial<Product> = {
    nombre: this.data?.nombre ?? '',
    categoria: this.data?.categoria ?? 'panaderia',
    precio: this.data?.precio ?? 0,
    stock: this.data?.stock ?? 0,
    descripcion: this.data?.descripcion ?? '',
    foto_url: this.data?.foto_url ?? '',
  };

  elegirFoto(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.subiendo.set(true);
    this.api.subirFoto(file).subscribe({
      next: (r) => { this.form.foto_url = r.foto_url; this.subiendo.set(false); },
      error: () => { this.subiendo.set(false); this.snack.open('No se pudo subir la foto', 'OK', { duration: 2500 }); },
    });
  }

  guardar() {
    if (!this.form.nombre?.trim()) { this.snack.open('El nombre es obligatorio', 'OK', { duration: 2000 }); return; }
    this.guardando.set(true);
    const req = this.editando
      ? this.api.actualizar(this.data!.id, this.form)
      : this.api.crear(this.form);
    req.subscribe({
      next: () => { this.guardando.set(false); this.ref.close(true); },
      error: (e) => {
        this.guardando.set(false);
        const msg = e.error?.errores?.join(', ') || 'Error al guardar';
        this.snack.open(msg, 'OK', { duration: 3000 });
      },
    });
  }
}
