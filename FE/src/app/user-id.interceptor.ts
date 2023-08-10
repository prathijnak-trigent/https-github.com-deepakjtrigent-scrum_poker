import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class UserIdInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<object>,
    next: HttpHandler): Observable<HttpEvent<object>> {
    console.log('sending request int');
    const userId = 'PPDD00';

    const modifiedRequest = request.clone({
      setHeaders: {
        'SP-U': userId,
      },
    });

    return next.handle(modifiedRequest);
  }
}
