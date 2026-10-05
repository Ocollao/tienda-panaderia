import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense';

const API = 'http://127.0.0.1:5000/api';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private http = inject(HttpClient);

  listar(desde = '', hasta = '', categoria = ''): Observable<Expense[]> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    if (categoria) params['categoria'] = categoria;
    return this.http.get<Expense[]>(`${API}/expenses`, { params });
  }

  crear(data: Partial<Expense>): Observable<Expense> {
    return this.http.post<Expense>(`${API}/expenses`, data);
  }

  actualizar(id: number, data: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${API}/expenses/${id}`, data);
  }

  eliminar(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${API}/expenses/${id}`);
  }

  resumen(desde = '', hasta = ''): Observable<{ total: number; n_gastos: number; ticket_promedio: number; por_categoria: { categoria: string; total: number; n: number }[] }> {
    const params: Record<string, string> = {};
    if (desde) params['desde'] = desde;
    if (hasta) params['hasta'] = hasta;
    return this.http.get<any>(`${API}/expenses/resumen`, { params });
  }

  formatoCLP(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor ?? 0);
  }

  formatoFecha(iso: string): string {
    return new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
