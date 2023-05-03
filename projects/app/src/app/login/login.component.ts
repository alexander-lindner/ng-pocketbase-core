import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {NgForm}                                      from "@angular/forms";
import {Router}                                      from "@angular/router";
import {ClientResponseError}                         from "pocketbase";
import {AuthService}                                 from "../../../../ng-pocketbase-core/src/services/auth.service";
import {LocalUser}                                   from "../User";

@Component(
  {
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
  },
)
export class LoginComponent implements OnInit, AfterViewInit {

  @ViewChild("loginForm") loginForm: NgForm = {} as NgForm;
  password: string = "";
  username: string = "";
  public isSending: boolean = false;
  private errorMessage: string = "";

  constructor(private auth: AuthService<LocalUser>, private router: Router) {

  }

  public ngAfterViewInit(): void {
  }

  public ngOnInit(): void {
    this.username = this.auth.snapshot.userData.username;
  }

  loginWithEmail() {
    this.isSending = true;
    this.errorMessage = "";
    this.auth
        .login(this.loginForm.value["email"], this.loginForm.value["password"])
        .subscribe(
          {
            next: () => {
              this.isSending = false;
              this.router.navigate(["/"]);
            },
            error: (err: ClientResponseError) => {
              this.isSending = false;
              this.errorMessage = (err.message) ? err.message : "Unknown error";
            },
          },
        );
  }
}
