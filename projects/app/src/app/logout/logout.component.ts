import { Component } from '@angular/core';
import {Router}      from "@angular/router";
import {AuthService} from "../../../../ng-pocketbase-core/src/services/auth.service";
import {LocalUser}   from "../User";

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent {
  constructor(private auth: AuthService<LocalUser>, private router: Router) {

  }
public logout(): void {
    this.auth.logout();
    this.router.navigate(["/"]);
  }
}
