import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale, Resumen, SaleItemInput } from '../models/sale';

const API = 'http://127.0.0.1:5000/api';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private http = inject(HttpClient);

  crear(medio_pago: string, vendedor: string, items: SaleItemInput[]): Observable<Sale> {
    return this.http.post<Sale>(`${API}/sales`, { medio_pago, vendedor, items });
  }

  listar(desde = '', hasta = ''): Observable<Sale[]> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    return this.http.get<Sale[]>(`${API}/sales`, { params });
  }

  detalle(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${API}/sales/${id}`);
  }

  resumen(desde = '', hasta = ''): Observable<Resumen> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    return this.http.get<Resumen>(`${API}/sales/resumen`, { params });
  }

  formatoCLP(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor ?? 0);
  }

  formatoFecha(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
