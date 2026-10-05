export interface AppUser {
  id: number;
  username: string;
  rol: 'dueno' | 'vendedor';
  activo: boolean;
  created_at?: string;
}
