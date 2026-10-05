import { Injectable, signal, computed } from '@angular/core';
import { CartLine } from '../models/sale';
import { Product } from '../models/product';

/** Carrito del punto de venta v0.2 (vive en memoria). */
@Injectable({ providedIn: 'root' })
export class CarritoService {
  lineas = signal<CartLine[]>([]);

  total = computed(() => this.lineas().reduce((t, l) => t + l.precio * l.cantidad, 0));
  cantidadTotal = computed(() => this.lineas().reduce((t, l) => t + l.cantidad, 0));

  agregar(p: Product) {
    if (p.stock <= 0) return;
    const actual = this.lineas();
    const linea = actual.find(l => l.product_id === p.id);
    if (linea) {
      if (linea.cantidad >= p.stock) return; // no vender mas del stock
      this.lineas.set(actual.map(l => l.product_id === p.id ? { ...l, cantidad: l.cantidad + 1 } : l));
    } else {
      this.lineas.set([...actual, { product_id: p.id, nombre: p.nombre, precio: p.precio, stock: p.stock, cantidad: 1 }]);
    }
  }

  cambiarCantidad(product_id: number, delta: number) {
    this.lineas.set(
      this.lineas()
        .map(l => l.product_id === product_id ? { ...l, cantidad: l.cantidad + delta } : l)
        .filter(l => l.cantidad > 0 && l.cantidad <= l.stock)
    );
  }

  quitar(product_id: number) {
    this.lineas.set(this.lineas().filter(l => l.product_id !== product_id));
  }

  limpiar() {
    this.lineas.set([]);
  }
}
