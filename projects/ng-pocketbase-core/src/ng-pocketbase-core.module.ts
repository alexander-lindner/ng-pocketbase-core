import {CommonModule}                                  from "@angular/common";
import {InjectionToken, ModuleWithProviders, NgModule} from "@angular/core";
import {IsLoggedInDirective}                           from "./directives/auth/loggedIn/is-logged-in.directive";
import {passwordEqualsDirective}                       from "./directives/password-equals.directive";

/**
 * This module contains all the core functionality of \@ng-pocketbase/core module.
 *
 * You can import this module in your app.module.ts like this:
 * ```typescript
 * @NgModule({
 *  imports: [
 *    NgPocketbaseCoreModule.forRoot({
 *      backendUrl: "http://localhost:3000",
 *      frontendUiUrl: "http://localhost:4200",
 *      redirectUrl: "http://localhost:4200",
 *    }),
 *  //...
 *  ],
 * //...
 * })
 *  export class AppModule { }
 * ```
 * @public
 */
@NgModule({
    declarations: [
      IsLoggedInDirective,
      passwordEqualsDirective,
    ],
    imports: [
      CommonModule,
    ],
    exports: [
      IsLoggedInDirective,
      passwordEqualsDirective,
    ]
  })
export class NgPocketbaseCoreModule {
  static forRoot(options?: ModuleOptions): ModuleWithProviders<NgPocketbaseCoreModule> {
    return ({
      ngModule: NgPocketbaseCoreModule,
      providers: [
        {
          provide: FOR_ROOT_OPTIONS_TOKEN,
          useValue: options,
        },
        {
          provide: PocketBaseConfig,
          useFactory: providePocketBaseConfig,
          deps: [FOR_ROOT_OPTIONS_TOKEN],
        },
      ],
    });
  }
}

/**
 * This class contains the configuration for the \@ng-pocketbase/core module.
 * @public
 */
export class PocketBaseConfig {
  constructor(readonly backendUrl: string, readonly frontendUiUrl: string,  readonly redirectUrl: string) {}

  public getBackendUrl(): string {
    return this.backendUrl;
  }

  public getFrontendUiUrl(): string {
    return this.frontendUiUrl;
  }

  public getRedirectUrl(): string {
    return this.redirectUrl;
  }
}

/**
 * This interface is used to pass each config option to the \@ng-pocketbase/core module.
 * @public
 */
export interface ModuleOptions {
  readonly frontendUiUrl: string;
  readonly backendUrl: string;
  readonly redirectUrl: string;
}

/**
 * This token is used to pass the config options to the \@ng-pocketbase/core module.
 * @public
 */
export const FOR_ROOT_OPTIONS_TOKEN = new InjectionToken<ModuleOptions>("forRoot() @ng-pocketbase/core configuration.");

/**
 * This function is used to provide the PocketBaseConfig to the \@ng-pocketbase/core module.
 * @param options - the config options
 * @returns config object
 * @public
 */
export function providePocketBaseConfig(options: ModuleOptions): PocketBaseConfig {
  // if (!options) {
  //   return null;
  // }
  // if (typeof (options.frontendUiUrl) !== "string") {
  //   return null;
  // }
  //
  // if (typeof (options.backendUrl) !== "string") {
  //   return null;
  // }
  return new PocketBaseConfig(options.backendUrl, options.frontendUiUrl, options.redirectUrl);
}


