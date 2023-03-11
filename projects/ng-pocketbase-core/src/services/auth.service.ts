import {Injectable} from "@angular/core";
import {
  Admin,
  AuthMethodsList,
  AuthProviderInfo,
  ClientResponseError,
  ExternalAuth,
  Record,
  RecordAuthResponse,
}                   from "pocketbase";
import {
  BehaviorSubject,
  from,
  Observable,
  Observer,
}                   from "rxjs";
import {
  User,
}                   from "../types";
import {
  PocketBaseService,
}                   from "./pocketbase.service";


@Injectable(
  {
    providedIn: "root",
  },
)
export class AuthService<U extends User> {
  //@ts-ignore
  public readonly userData: BehaviorSubject<U> = new BehaviorSubject<U>();
  public readonly isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly providers: BehaviorSubject<Array<AuthProviderInfo>> = new BehaviorSubject<Array<AuthProviderInfo>>([]);

  public get snapshot(): { loggedIn: boolean, userData: U, providers: Array<AuthProviderInfo>, isAdmin: boolean } {
    return {
      loggedIn: this.isUserLoggedIn(),
      userData: this.userData.value,
      providers: this.providers.value,
      isAdmin: this._isAdmin(),
    };
  }

  constructor(private pbservice: PocketBaseService) {
    this.pbservice.getPB()
        .collection("users")
        .listAuthMethods()
        .then((authMethods: AuthMethodsList) => {
          this.providers.next(authMethods.authProviders);
        });
    this.isLoggedIn.next(this.isUserLoggedIn());
    this.isAdmin.next(this._isAdmin());

    if (this.isUserLoggedIn()) {
      this.userData.next(
        {
          id: this.pbservice.getPB().authStore.model?.id,
          email: this.pbservice.getPB().authStore.model?.email,
          username: this.pbservice.getPB().authStore.model?.["username"],
          emailVisibility: this.pbservice.getPB().authStore.model?.["emailVisibility"],
        } as unknown as U,
      );
    } else {
      this.userData.next(
        {
          email: null,
          username: null,
          emailVisibility: false,
        } as unknown as U,
      );
    }
  }

  public authRefresh(): Observable<RecordAuthResponse<Record>> {
    return from(
      this.pbservice.getPB()
          .collection("users")
          .authRefresh(),
    );
  }

  public confirmVerification(token: string): Observable<boolean> {
    return from(
      this.pbservice.getPB()
          .collection("users")
          .confirmVerification(token),
    );
  }

  public requestVerification(email: string): Observable<boolean> {
    return from(
      this.pbservice.getPB()
          .collection("users")
          .requestVerification(email),
    );
  }

  public changeEmail(newMail: string): Observable<boolean> {
    if (!this.isUserLoggedIn()) {
      return this.getNotLoggedInObservable();
    }
    return from(
      this.pbservice.getPB()
          .collection("users")
          .requestEmailChange(newMail),
    );
  }


  public confirmEmailChange(token: string, password: string): Observable<boolean> {
    return from(
      this.pbservice.getPB()
          .collection("users")
          .confirmEmailChange(
            token,
            password,
          )
          .then(value => {
            this.authRefresh();
            return value;
          }),
    );
  }

  public listOauth2Accounts(): Observable<Array<ExternalAuth>> {
    if (!this.isUserLoggedIn()) {
      return this.getNotLoggedInObservable<Array<ExternalAuth>>();
    }
    const model = this.pbservice.getPB().authStore.model;
    if (!model) {
      return this.getNotLoggedInObservable<Array<ExternalAuth>>();
    }
    return from(
      this.pbservice.getPB()
          .collection("users")
          .listExternalAuths(
            model.id,
          ),
    );
  }

  private _isAdmin(): boolean {
    const model = this.pbservice.getPB().authStore.model;
    return model instanceof Admin;
  }

  private isUserLoggedIn(): boolean {
    const model = this.pbservice.getPB().authStore.model;
    return model instanceof Record || model instanceof Admin;
  }


  public logout(): void {
    this.pbservice.getPB().authStore.clear();
    this.isLoggedIn.next(false);
  }

  public login(username: string, password: string): Promise<RecordAuthResponse<Record> | ClientResponseError> {
    return this.pbservice.getPB()
               .collection("users")
               .authWithPassword(username, password)
               .then((r) => {
                 this.isLoggedIn.next(true);
                 this.isAdmin.next(this._isAdmin());
                 return r;
               })
               .catch((err: ClientResponseError) => {
                 this.isLoggedIn.next(false);
                 this.isAdmin.next(false);
                 throw err;
               });

  }

  public gotoExternalAuthProvider(provider: AuthProviderInfo): void {
    const url: string = provider.authUrl + this.pbservice.getRedirectUrl();
    localStorage.setItem("provider", JSON.stringify(provider));
    window.location.href = url;
  }

  public oauth2(provider: AuthProviderInfo, code: string): Promise<RecordAuthResponse<Record>> {
    return this.pbservice.getPB()
               .collection("users")
               .authWithOAuth2(
                 provider.name,
                 code,
                 provider.codeVerifier,
                 this.pbservice.getRedirectUrl(),
                 {
                   emailVisibility: false,
                 },
               )
               .then(async (authData: RecordAuthResponse) => {
                 this.isLoggedIn.next(this.isUserLoggedIn());
                 return authData;
               });
  }

  private getNotLoggedInObservable<T>(): Observable<T> {
    return new Observable((observer: Observer<T>) => {
      observer.error(new Error("Not logged in"));
      observer.complete();
      return {
        unsubscribe() { },
      };
    });
  }

  public unlinkOAuth2Provider(provider: string): Observable<boolean> {
    if (!this.isUserLoggedIn()) {
      return this.getNotLoggedInObservable<boolean>();
    }
    const model = this.pbservice.getPB().authStore.model;
    if (!model) {
      return this.getNotLoggedInObservable<boolean>();
    }
    return from(
      this.pbservice.getPB()
          .collection("users")
          .unlinkExternalAuth(model.id, provider),
    );
  }

  /**
   * Change the password of the logged-in user.
   *
   * Afterwards the user is logged out.
   * The password and its confirmation must be identical, however this is not checked on the client but the server.
   * @param {string} password password
   * @param {string} password2 confirmation of password
   * @param {string} oldPassword the old password
   * @returns {Observable<Record>} the updated user record
   */
  public changePassword(password: string, password2: string, oldPassword: string): Observable<Record> {
    if (!this.isUserLoggedIn()) {
      return this.getNotLoggedInObservable<Record>();
    }
    const model = this.pbservice.getPB().authStore.model;
    if (!model) {
      return this.getNotLoggedInObservable<Record>();
    }
    return from(
      this.pbservice.getPB()
          .collection("users")
          .update(
            model.id,
            {
              password: password,
              passwordConfirm: password2,
              oldPassword: oldPassword,
            },
          )
          .then((value: Record) => {
            this.logout();
            return value;
          }),
    );
  }
}

