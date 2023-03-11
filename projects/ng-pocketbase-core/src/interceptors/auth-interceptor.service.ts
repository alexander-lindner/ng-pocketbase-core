import {HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable}                                from "@angular/core";
import {AuthService}                               from "../services/auth.service";
import {PocketBaseService}                         from "../services/pocketbase.service";
import {User}                                      from "../types";


/**
 * Interceptor to add the Authorization header to all requests when the request targets the pocketbase backend.
 *
 * @example
 * Add the interceptor to the providers array in the app.module.ts
 * ```typescript
 * providers: [
 *  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
 *  //...
 * ]
 * ```
 */
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private pbs: PocketBaseService, private authService: AuthService<User>) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): any {
    if (this.authService.snapshot.loggedIn && req.url.startsWith(this.pbs.backendUrl)) {
      const token: string = this.pbs.getPB().authStore.token;
      if (token) {
        return next.handle(
          req.clone(
            {
              headers: req.headers.set("Authorization", `Bearer ${token}`),
            },
          ),
        );
      }
    }
    return next.handle(req);
  }
}
