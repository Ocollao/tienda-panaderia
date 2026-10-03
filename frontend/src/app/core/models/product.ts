export interface Product {
  id: number;
  nombre: string;
  categoria: 'panaderia' | 'pasteleria' | 'minimarket';
  precio: number;
  stock: number;
  stock_min: number;
  descripcion: string;
  foto_url: string;
  activo: boolean;
  stock_bajo?: boolean;
}

export const CATEGORIAS = [
  { valor: '', nombre: 'Todas' },
  { valor: 'panaderia', nombre: 'Panadería' },
  { valor: 'pasteleria', nombre: 'Pastelería' },
  { valor: 'minimarket', nombre: 'Minimarket' },
] as const;
