import {CommonModule}                                  from "@angular/common";
import {InjectionToken, ModuleWithProviders, NgModule} from "@angular/core";
import {IsLoggedInDirective}                           from "./directives/auth/loggedIn/is-logged-in.directive";
import {passwordEqualsDirective}                       from "./directives/password-equals.directive";

@NgModule(
  {
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
  },
)
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


export class PocketBaseConfig {
  constructor(readonly backendUrl: string, readonly frontendUiUrl: string,  readonly redirectUrl: string) {
  }

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

export interface ModuleOptions {
  readonly frontendUiUrl: string;
  readonly backendUrl: string;
  readonly redirectUrl: string;
}

// I am the token that makes the raw options available to the following factory function.
// --
// NOTE: This value has to be exported otherwise the AoT compiler won't see it.
export var FOR_ROOT_OPTIONS_TOKEN = new InjectionToken<ModuleOptions>("forRoot() MyService configuration.");

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


