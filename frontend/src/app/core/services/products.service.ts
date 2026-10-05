import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { apiBase, uploadsBase } from '../config/api';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private get API() { return apiBase(); }
  private get UPLOADS() { return uploadsBase(); }

  listar(categoria = '', q = ''): Observable<Product[]> {
    const params: Record<string, string> = {};
    if (categoria) params['categoria'] = categoria;
    if (q) params['q'] = q;
    return this.http.get<Product[]>(`${this.API}/products`, { params });
  }

  crear(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.API}/products`, data);
  }

  actualizar(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.API}/products/${id}`, data);
  }

  eliminar(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.API}/products/${id}`);
  }

  stockBajo(): Observable<{ total: number; productos: Product[] }> {
    return this.http.get<{ total: number; productos: Product[] }>(`${this.API}/products/low-stock`);
  }

  subirFoto(file: File): Observable<{ foto_url: string }> {
    const form = new FormData();
    form.append('foto', file);
    return this.http.post<{ foto_url: string }>(`${this.API}/upload`, form);
  }

  fotoCompleta(url: string): string {
    if (!url) return 'https://placehold.co/400x250?text=Panaderia';
    if (url.startsWith('http')) return url;
    return `${this.UPLOADS}${url}`;
  }

  formatoCLP(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor ?? 0);
  }
}
