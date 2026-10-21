import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, MonoTypeOperatorFunction } from 'rxjs';

export const manejarErrorHttp = <T>(): MonoTypeOperatorFunction<T> =>
  catchError((error: HttpErrorResponse) =>
    throwError(
      () =>
        new Error(
          typeof error.error?.error === 'string'
            ? error.error.error
            : 'No se pudo completar la solicitud. Intenta nuevamente.',
        ),
    ),
  );
