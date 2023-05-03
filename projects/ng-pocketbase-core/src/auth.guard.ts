import {inject}                                                                         from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {AuthService}                                                                    from "./services/auth.service";
import {User}                                                                           from "./types";

export const IsLoggedInGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService: AuthService<User> = inject(AuthService);

  return authService.snapshot.loggedIn;
};

export const IsLoggedInGuardChild: CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return IsLoggedInGuard(route, state);
};
