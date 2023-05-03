import {Component, OnInit, ViewChild}      from "@angular/core";
import {NgForm}                            from "@angular/forms";
import {ClientResponseError, ExternalAuth} from "pocketbase";
import {AuthService}                       from "../../../../ng-pocketbase-core/src/public-api";
import {LocalUser}                         from "../User";

@Component(
  {
    selector: "app-profil",
    templateUrl: "./profil.component.html",
    styleUrls: ["./profil.component.scss"],
  },
)
export class ProfilComponent implements OnInit {
  @ViewChild("emailForm") emailForm: NgForm = {} as NgForm;
  @ViewChild("passwordForm") passwordForm: NgForm = {} as NgForm;
  public username: string = "";
  public isSending: boolean = false;
  public errorMessage: string = "";
  public ownProviders: Array<ExternalAuth> = [];


  constructor(private auth: AuthService<LocalUser>) {
    this.auth.listOauth2Accounts().subscribe(values => this.ownProviders = values);
  }

  ngOnInit(): void {
    this.username = this.auth.snapshot.userData.username;
  }

  public removeProvider(provider: string): void {
    this.auth.unlinkOAuth2Provider(provider);
  }

  public changeEmail(): void {
    this.isSending = true;
    this.errorMessage = "";
    this.auth.changeEmail(this.emailForm.value["email"])
        .subscribe(
          {
            next: value => {
              this.isSending = false;
            },
            error: (error: ClientResponseError) => {
              this.isSending = false;
              this.errorMessage = (error.message) ? error.message : "Unknown error";
              if (error.data["data"]["email"] !== undefined) {
                this.emailForm?.control.get("email")?.setErrors({incorrect: true});
              }
            },
          },
        );

  }

  public changePassword(): void {
    this.isSending = true;
    this.errorMessage = "";
    this.auth
        .changePassword(
          this.passwordForm.value["password"],
          this.passwordForm.value["password2"],
          this.passwordForm.value["oldPassword"],
        )
        .subscribe(
          {
            next: value => {
              this.isSending = false;
            },
            error: (error: ClientResponseError) => {
              this.isSending = false;
              this.errorMessage = (error.message) ? error.message : "Unknown error";
              console.log(error.data);
              if (error.data["data"]["oldPassword"] !== undefined) {
                this.passwordForm.control.get("oldPassword")?.setErrors({incorrect: true});
              }
              if (error.data["data"]["password"] !== undefined) {
                this.passwordForm.control.get("password")?.setErrors({incorrect: true});
              }
              if (error.data["data"]["passwordConfirm"] !== undefined) {
                this.passwordForm.control.get("password2")?.setErrors({incorrect: true});
              }
            },
          },
        );
  }
}
