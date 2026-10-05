import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** v0.4: exige estar logeado. Si no, manda al /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.logeado()) return true;
  return router.parseUrl('/login');
};

/** v0.4: solo el dueno entra (gastos, dashboard, usuarios, inventario editar). */
export const duenoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.logeado() && auth.esDueno()) return true;
  return router.parseUrl('/catalogo');
};
