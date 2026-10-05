import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { SalesService } from '../../core/services/sales.service';
import { Sale } from '../../core/models/sale';

/** Detalle imprimible de boleta v0.2. */
@Component({
  selector: 'app-boleta-detail-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="boleta" id="boleta-print">
      <h2>🥖 La Espiga</h2>
      <p>Boleta <strong>{{ data.folio }}</strong> · {{ fecha(data.fecha) }}</p>
      <p>Pago: {{ data.medio_pago }} @if (data.vendedor) { · Vendedor: {{ data.vendedor }} }</p>
      <mat-divider></mat-divider>
      @for (it of data.items; track it.id) {
        <div class="linea">
          <span>{{ it.cantidad }} × {{ it.nombre }}</span>
          <span>{{ fmt(it.subtotal) }}</span>
        </div>
        <small class="unit">{{ fmt(it.precio_unit) }} c/u</small>
      }
      <mat-divider></mat-divider>
      <div class="total"><span>TOTAL</span><strong>{{ fmt(data.total) }}</strong></div>
    </div>
    <div mat-dialog-actions align="end" class="no-print">
      <button mat-button mat-dialog-close>Cerrar</button>
      <button mat-raised-button color="primary" (click)="imprimir()"><mat-icon>print</mat-icon> Imprimir</button>
    </div>
  `,
  styles: [`
    .boleta { padding: 8px 4px; font-family: monospace; }
    .boleta h2 { text-align: center; margin: 0 0 4px; }
    .boleta p { text-align: center; margin: 2px 0; }
    .linea { display: flex; justify-content: space-between; margin-top: 6px; }
    .unit { color: #888; }
    .total { display: flex; justify-content: space-between; font-size: 1.2rem; margin-top: 8px; }
    @media print {
      body * { visibility: hidden; }
      #boleta-print, #boleta-print * { visibility: visible; }
      #boleta-print { position: absolute; left: 0; top: 0; width: 100%; }
    }
  `],
})
export class BoletaDetailDialog {
  data: Sale = inject(MAT_DIALOG_DATA);
  private api = inject(SalesService);
  fmt = (v: number) => this.api.formatoCLP(v);
  fecha = (iso: string) => this.api.formatoFecha(iso);
  imprimir() { window.print(); }
}
