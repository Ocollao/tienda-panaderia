import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppUser } from '../models/user';
import { apiBase } from '../config/api';

const KEY = 'espiga_user_v04';

/** Auth simple v0.4: guarda el usuario logeado en localStorage (dueno | vendedor). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private get API() { return apiBase(); }

  actual = signal<AppUser | null>(null);
  esDueno = computed(() => this.actual()?.rol === 'dueno');
  logeado = computed(() => !!this.actual());

  constructor() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.actual.set(JSON.parse(raw) as AppUser);
    } catch { /* parte sin sesion */ }
  }

  login(username: string, password: string): Observable<{ ok: boolean; user: AppUser }> {
    return this.http.post<{ ok: boolean; user: AppUser }>(`${this.API}/auth/login`, { username, password }).pipe(
      tap((r) => this.guardar(r.user))
    );
  }

  registrar(username: string, password: string, rol: string): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.API}/auth/register`, {
      username, password, rol,
      solicitado_por: this.actual()?.username || '',
    }, { headers: this.headersDueno() });
  }

  listar(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(`${this.API}/users`);
  }

  actualizar(id: number, data: Partial<AppUser> & { password?: string }): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.API}/users/${id}`, {
      ...data, solicitado_por: this.actual()?.username || '',
    }, { headers: this.headersDueno() });
  }

  headersDueno(): HttpHeaders {
    return new HttpHeaders({
      'X-USER': this.actual()?.username || '',
      'X-ROL': this.actual()?.rol || '',
    });
  }

  salir() {
    this.actual.set(null);
    localStorage.removeItem(KEY);
  }

  private guardar(u: AppUser) {
    this.actual.set(u);
    localStorage.setItem(KEY, JSON.stringify(u));
  }
}
