import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import {
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { tap } from 'rxjs';

function loggingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  console.log('[INCOMING REQUEST] :>> ', req);
  /** We can set headers, body...etc here using the clone method */
  // const request = req.clone({
  //   headers: req.headers.set('X-DEBUG', 'TESTING'),
  // });

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.log('[INCOMING RESPONSE] :>> ', event);
          console.log('event.status :>> ', event.status);
          console.log('event.body :>> ', event.body);
        }
      },
    }),
  );
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([loggingInterceptor]))],
}).catch((err) => console.error(err));
