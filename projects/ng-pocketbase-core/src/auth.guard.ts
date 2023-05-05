import {inject}                                                                         from "@angular/core";
import {ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, RouterStateSnapshot} from "@angular/router";
import {AuthService}                                                                    from "./services/auth.service";
import {User}                                                                           from "./types";

/**
 * A router guard that checks if the user is logged in.
 * @public
 * @param route - the current activated route
 * @param state - the router state
 * @returns true if the user is logged in
 */
export const IsLoggedInGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService: AuthService<User> = inject(AuthService);

  return authService.snapshot.loggedIn;
};
/**
 * A router child guard that checks if the user is logged in.
 * @public
 * @param route - the current activated route
 * @param state - the router state
 * @returns true if the user is logged in
 */
export const IsLoggedInGuardChild: CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return IsLoggedInGuard(route, state);
};
