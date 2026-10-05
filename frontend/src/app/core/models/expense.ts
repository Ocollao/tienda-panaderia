export interface Expense {
  id: number;
  concepto: string;
  categoria: 'insumos' | 'sueldos' | 'arriendo' | 'servicios' | 'otros';
  monto: number;
  fecha: string;
  nota: string;
  responsable: string;
}

export const GASTO_CATEGORIAS = [
  { valor: 'insumos', nombre: 'Insumos' },
  { valor: 'sueldos', nombre: 'Sueldos' },
  { valor: 'arriendo', nombre: 'Arriendo' },
  { valor: 'servicios', nombre: 'Servicios' },
  { valor: 'otros', nombre: 'Otros' },
] as const;

export interface Dashboard {
  desde: string;
  hasta: string;
  ventas: { total: number; n_boletas: number; ticket_promedio: number };
  gastos: { total: number; n_gastos: number; ticket_promedio: number };
  utilidad: number;
  margen_pct: number;
  por_medio_pago: { medio_pago: string; total: number; n: number }[];
  gastos_por_categoria: { categoria: string; total: number; n: number }[];
  top_productos: { product_id: number; nombre: string; cantidad: number; total: number }[];
  por_dia: { fecha: string; ventas: number; n_boletas: number; gastos: number }[];
  stock_bajo?: { total: number; productos: { id: number; nombre: string; stock: number; stock_min: number }[] };
}
