import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';

// v0.1: URL directa al Flask. En v0.2 se movera a environment.ts
const API = 'http://127.0.0.1:5000/api';
const UPLOADS = 'http://127.0.0.1:5000';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  listar(categoria = '', q = ''): Observable<Product[]> {
    const params: Record<string, string> = {};
    if (categoria) params['categoria'] = categoria;
    if (q) params['q'] = q;
    return this.http.get<Product[]>(`${API}/products`, { params });
  }

  crear(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${API}/products`, data);
  }

  actualizar(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${API}/products/${id}`, data);
  }

  eliminar(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${API}/products/${id}`);
  }

  subirFoto(file: File): Observable<{ foto_url: string }> {
    const form = new FormData();
    form.append('foto', file);
    return this.http.post<{ foto_url: string }>(`${API}/upload`, form);
  }

  fotoCompleta(url: string): string {
    if (!url) return 'https://placehold.co/400x250?text=Panaderia';
    if (url.startsWith('http')) return url;
    return `${UPLOADS}${url}`;
  }

  formatoCLP(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor ?? 0);
  }
}
