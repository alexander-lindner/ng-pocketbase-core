import {NgModule}             from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent}        from "./home/home.component";
import {LoginComponent}       from "./login/login.component";
import {LogoutComponent}      from "./logout/logout.component";
import {ProfilComponent}      from "./profil/profil.component";
import {UsersDetailComponent} from "./users/users-detail/users-detail.component";
import {UsersComponent}       from "./users/users.component";

const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "login", component: LoginComponent},
  {path: "logout", component: LogoutComponent},
  {path: "profil", component: ProfilComponent},
  {path: "users", children: [
      {path: "", component: UsersComponent},
      {path: ":id", component: UsersDetailComponent},
    ]},
  {path: "**", redirectTo: "/not-found"},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
