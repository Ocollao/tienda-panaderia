export interface SaleItemInput {
  product_id: number;
  cantidad: number;
}

export interface SaleItem extends SaleItemInput {
  id: number;
  nombre: string;
  precio_unit: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  folio: string;
  fecha: string;
  total: number;
  medio_pago: string;
  vendedor: string;
  n_items: number;
  items?: SaleItem[];
}

export interface Resumen {
  hoy: { n_boletas: number; total: number; ticket_promedio: number };
  ultimos_7_dias: { n_boletas: number; total: number; ticket_promedio: number };
  rango: { n_boletas: number; total: number; ticket_promedio: number } | null;
}

export interface CartLine {
  product_id: number;
  nombre: string;
  precio: number;
  stock: number;
  cantidad: number;
}
