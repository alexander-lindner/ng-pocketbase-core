import {Injectable}                                  from "@angular/core";
import {
  Admin,
  AuthMethodsList,
  AuthProviderInfo,
  ClientResponseError,
  ExternalAuth,
  Record,
  RecordAuthResponse,
}                                                    from "pocketbase";
import {BehaviorSubject, from, Observable, Observer} from "rxjs";
import {AuthData, User}                              from "../types";
import {PocketBaseService}                           from "./pocketbase.service";


/**
 * The Auth Service
 * @public
 */
@Injectable(
  {
    providedIn: "root",
  },
)
export class AuthService<U extends User> {
  public readonly userData: BehaviorSubject<U> = new BehaviorSubject<U>({} as U);
  public readonly isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly isAdmin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly providers: BehaviorSubject<Array<AuthProviderInfo>> = new BehaviorSubject<Array<AuthProviderInfo>>([]);

  /**
   * get the user data
   * @returns the user data
   */
  public get snapshot(): AuthData<U> {
    return {
      loggedIn: this.isUserLoggedIn(),
      userData: this.userData.value,
      providers: this.providers.value,
      isAdmin: this._isAdmin(),
    };
  }

  /**
   * Constructor
   *
   * setups the auth service
   *
   * @param pbservice - the PocketBase service
   */
  constructor(private pbservice: PocketBaseService) {
    this.pbservice
        .getPB()
        .collection("users")
        .listAuthMethods()
        .then((authMethods: AuthMethodsList) => this.providers.next(authMethods.authProviders));
    this.isLoggedIn.next(this.isUserLoggedIn());
    this.isAdmin.next(this._isAdmin());

    const model: Record | Admin | null = this.pbservice.getPB().authStore.model;
    if (this.isUserLoggedIn() && model) {
      this.userData.next(
        {
          id: model?.id,
          email: model?.email,
          username: model?.["username"],
          emailVisibility: model?.["emailVisibility"],
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

  /**
   * automatically refresh the auth token and data
   * @returns Observable that emits the auth response
   */
  public authRefresh(): Observable<RecordAuthResponse<Record>> {
    return from(
      this.pbservice
          .getPB()
          .collection("users")
          .authRefresh(),
    );
  }

  /**
   * @beta
   * @param token - the token
   * @returns an observable that emits if the request was successful
   */
  public confirmVerification(token: string): Observable<boolean> {
    return from(
      this.pbservice
          .getPB()
          .collection("users")
          .confirmVerification(token),
    );
  }

  /**
   * request an email verification
   * @param email - the email address
   * @returns Observable that emits true if email verification was sent successfully
   */
  public requestVerification(email: string): Observable<boolean> {
    return from(
      this.pbservice
          .getPB()
          .collection("users")
          .requestVerification(email),
    );
  }

  /**
   * Change the email of the current user
   * @param newMail - the new email address
   * @returns Observable that emits true if the email change was successful
   */
  public changeEmail(newMail: string): Observable<boolean> {
    if (!this.isUserLoggedIn()) {
      return this.getNotLoggedInObservable();
    }
    return from(
      this.pbservice
          .getPB()
          .collection("users")
          .requestEmailChange(newMail),
    );
  }


  /**
   * @beta
   * @param token - token
   * @param password - password
   * @returns an observable that emits if the request was successful
   */
  public confirmEmailChange(token: string, password: string): Observable<boolean> {
    return from(
      this.pbservice
          .getPB()
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

  /**
   * List all external auth providers the current user has linked to their account.
   * @returns Observable that emits an array of external auth providers
   */
  public listOauth2Accounts(): Observable<Array<ExternalAuth>> {
    if (!this.isUserLoggedIn()) {
      return this.getNotLoggedInObservable<Array<ExternalAuth>>();
    }
    const model: Record | Admin | null = this.pbservice.getPB().authStore.model;
    if (!model) {
      return this.getNotLoggedInObservable<Array<ExternalAuth>>();
    }
    return from(
      this.pbservice
          .getPB()
          .collection("users")
          .listExternalAuths(model.id),
    );
  }

  /**
   * returns the current admin state of the user
   * @returns true if the user is an admin
   */
  private _isAdmin(): boolean {
    const model: Record | Admin | null = this.pbservice.getPB().authStore.model;
    return model instanceof Admin;
  }

  /**
   * returns the current state of the user
   * @returns true if the user is logged in
   */
  private isUserLoggedIn(): boolean {
    const model: Record | Admin | null = this.pbservice.getPB().authStore.model;
    return model instanceof Record || model instanceof Admin;
  }

  /**
   * logs the current user out
   */
  public logout(): void {
    this.pbservice.getPB().authStore.clear();
    this.isLoggedIn.next(false);
  }

  /**
   * login with username and password
   *
   * @param username - username or email
   * @param password - password
   * @returns an observable that emits the auth response
   */
  public login(username: string, password: string): Observable<RecordAuthResponse<Record> | ClientResponseError> {
    return from(
      this.pbservice
          .getPB()
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
          }),
    );

  }

  /**
   * redirect the current logged-in user to the external oauth provider
   * @param provider - provider that can be retrieved from `listOauth2Accounts()`
   */
  public gotoExternalAuthProvider(provider: AuthProviderInfo): void {
    localStorage.setItem("provider", JSON.stringify(provider));
    window.location.href = provider.authUrl + this.pbservice.redirectUrl;
  }

  /**
   * login with external oauth provider
   * @param provider - provider that can be retrieved from `listOauth2Accounts()`
   * @param code - oauth code
   * @returns an observable that emits the auth response
   */
  public oauth2(provider: AuthProviderInfo, code: string): Observable<RecordAuthResponse<Record>> {
    return from(
      this.pbservice
          .getPB()
          .collection("users")
          .authWithOAuth2(
            provider.name,
            code,
            provider.codeVerifier,
            this.pbservice.redirectUrl,
            {
              emailVisibility: false,
            },
          )
          .then(async (authData: RecordAuthResponse) => {
            this.isLoggedIn.next(this.isUserLoggedIn());
            return authData;
          }),
    );
  }

  /**
   * Returns an observable that emits an error and completes.
   *
   * It is a helper function to return an observable that emits an error 'not logged in'.
   *
   * @returns an observable that emits an error and completes
   */
  private getNotLoggedInObservable<T>(): Observable<T> {
    return new Observable((observer: Observer<T>) => {
      observer.error(new Error("Not logged in"));
      observer.complete();
      return {
        unsubscribe() { },
      };
    });
  }

  /**
   * Unlink an OAuth2 provider from the logged-in user.
   * @param provider - unique name of the provider
   * @returns true if the unlinking was successful
   */
  public unlinkOAuth2Provider(provider: string): Observable<boolean> {
    if (!this.isUserLoggedIn()) {
      return this.getNotLoggedInObservable<boolean>();
    }
    const model: Record | Admin | null = this.pbservice.getPB().authStore.model;
    if (!model) {
      return this.getNotLoggedInObservable<boolean>();
    }
    return from(
      this.pbservice
          .getPB()
          .collection("users")
          .unlinkExternalAuth(model.id, provider),
    );
  }

  /**
   * Change the password of the logged-in user.
   *
   * Afterward, the user is logged out.
   * The password and its confirmation must be identical; however, this is not checked on the client but the server.
   * @param password - password
   * @param password2 - confirmation of password
   * @param oldPassword - the old password
   * @returns the updated user record
   */
  public changePassword(password: string, password2: string, oldPassword: string): Observable<Record> {
    if (!this.isUserLoggedIn()) {
      return this.getNotLoggedInObservable<Record>();
    }
    const model: Record | Admin | null = this.pbservice.getPB().authStore.model;
    if (!model) {
      return this.getNotLoggedInObservable<Record>();
    }
    return from(
      this.pbservice
          .getPB()
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

