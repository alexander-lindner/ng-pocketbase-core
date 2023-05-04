import {NgOptimizedImage}                 from "@angular/common";
import {HTTP_INTERCEPTORS}                from "@angular/common/http";
import {NgModule}                         from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule}                  from "@angular/material/button";
import {MatCardModule}                    from "@angular/material/card";
import {MatCheckboxModule}                from "@angular/material/checkbox";
import {MatCommonModule}                  from "@angular/material/core";
import {MatInputModule}                   from "@angular/material/input";
import {MatSortModule}                    from "@angular/material/sort";
import {MatTableModule}                   from "@angular/material/table";
import {MatTabsModule}                    from "@angular/material/tabs";
import {BrowserModule}                    from "@angular/platform-browser";
import {
  AuthInterceptorService,
  NgPocketbaseCoreModule,
  PocketBaseConfig,
}                                         from "../../../ng-pocketbase-core/src/public-api";
import {environment}                      from "../environments/environment";

import {AppRoutingModule}        from "./app-routing.module";
import {AppComponent}            from "./app.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {MatToolbarModule}     from "@angular/material/toolbar";
import {MatIconModule}        from "@angular/material/icon";
import {LoginComponent}       from "./login/login.component";
import {LogoutComponent}      from "./logout/logout.component";
import {ProfilComponent}      from "./profil/profil.component";
import {HomeComponent}        from "./home/home.component";
import {UsersComponent}       from "./users/users.component";
import {UsersDetailComponent} from "./users/users-detail/users-detail.component";


@NgModule(
  {
    declarations: [
      AppComponent,
      LoginComponent,
      LogoutComponent,
      ProfilComponent,
      HomeComponent,
      UsersComponent,
      UsersDetailComponent,
    ],
    imports: [
      NgPocketbaseCoreModule.forRoot(new PocketBaseConfig(environment.backendUrl, environment.frontendUiUrl, environment.frontendUiUrl + "/auth/redirect")),
      BrowserModule,
      AppRoutingModule,
      BrowserAnimationsModule,
      MatToolbarModule,
      MatIconModule,
      MatButtonModule,
      FormsModule,
      MatInputModule,
      MatTabsModule,
      MatCommonModule,
      MatCardModule,
      MatTableModule,
      NgOptimizedImage,
      MatSortModule,
      MatCheckboxModule,
      ReactiveFormsModule,
    ],
    providers: [
      {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true},
    ],
    bootstrap: [AppComponent],
  },
)
export class AppModule {}
