# ng-pocketbase

An ready to use angular library for [Pocketbase](https://pocketbase.io).
It provides a set of services for authentication and realtime data handling.

## Installation
`yarn add @ng-pocketbase/core` or `npm install @ng-pocketbase/core`

https://www.npmjs.com/package/@ng-pocketbase/core

## API

See [GitHub Pages](https://alexander-lindner.github.io/ng-pocketbase-core).

## Usage

### Initialization
In your `app.module.ts` import the `PocketBaseModule` and provide the configuration.
```typescript
@NgModule(
  {
    imports: [
      NgPocketbaseCoreModule.forRoot(
          new PocketBaseConfig(
              environment.backendUrl, 
              environment.frontendUiUrl,
              environment.frontendUiUrl + "/auth/redirect" // the return url for oauth2 logins
          )
      ),
    ]
  },
)
export class AppModule {}
```
with the environment variables
```typescript
export const environment = {
  production: false,
  frontendUiUrl: 'http://localhost:4200',
  backendUrl: 'http://127.0.0.1:8090'
}
```
### Service
For every table, create a service that extends [BasicCrud<TYPE>](https://alexander-lindner.github.io/ng-pocketbase-core/classes/basiccrud.html).
As a type parameter, you need to provide a type that extends [BasicType](https://alexander-lindner.github.io/ng-pocketbase-core/interfaces/basictype.html).
```typescript

export type Detail = BasicType & {
    //...
}

@Injectable({providedIn: "root"})
export class DetailsService extends BasicCrud<Detail> {
  constructor(pbs: PocketBaseService) {
    super(pbs, "details"); // table name is "details"
    this.requestRecords(); // load all records from the table 
  }

  protected createItem(record: Record): Detail {
    return {
      id: record.id,
      feed: record.feed,
      weight: parseInt(record.weight),
      name: record.name,
    };
  }
}
```
Additionally, you need a factory method `createItem` that creates an instance of your type from a [Record](https://alexander-lindner.github.io/ng-pocketbase-core/interfaces/record.html).

Now you can use it like so

```typescript
export class DetailsComponent implements OnInit {
    private details: Array<Detail> = [];
    
    constructor(private DetailsService: DetailsService) {}

    public ngOnInit(): void {
        this.DetailsService.getItems().subscribe((value: Array<Detail>) => {
            this.details = value;
        });

        this.DetailsService.create({...}).subscribe((value: Detail) => { console.log(value.id); // fdsafdsadadfs });
        this.DetailsService.getById("fdsafdsadadfs").subscribe((value: Detail) => { });
        this.DetailsService.update("fdsafdsadadfs", {name: "test"}).subscribe((value: Detail) => { });
        this.DetailsService.delete("fdsafdsadadfs").subscribe((success: boolean) => { });
    }
}
```
### Authentication

To interact with the authentication service, you need to use the `AuthService<U extends User>` service that is provided by this package.
The provided user type `U` reflects the made changes to the user table.
So if you don't change the user table, you can use the provided `User` type, however, we recommend to create your own (empty) user type that extends the `User` type.
That way, you can easily add additional fields to the user table later on.
```typescript
export type CustomUser = User & {
    
}
```
Now you can use the `AuthService<CustomUser>` service like so

```typescript
export class CustomAuthComponent implements OnInit {
  @ViewChild("loginForm") loginForm: NgForm = {} as NgForm;
  username: string = "";
  public isSending: boolean = false;
  private errorMessage: string = "";
  
  constructor(private auth: AuthService<CustomUser>, private router: Router) {}
  
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
  public logout(): void {
    this.auth.logout();
    this.router.navigate(["/"]);
  }
}
```
Furthermore, there is the `*isLoggedIn` directive that can be used to only use html elements when logged in or not logged in.
```angular2html
<button routerLinkActive="active" routerLink="/login" *isLoggedIn="false">
    Login
</button>
<button routerLinkActive="active" routerLink="/logout" *isLoggedIn="true">
    Logout
</button>
```

### Interceptors
```typescript
providers: [
 { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
 //...
]
```


### OAuth
After you configure an oAuth provider in the pocketbase server, you can receive all available providers:
```typescript
export class LoginComponent implements OnInit {
  providers: Array<AuthProviderInfo> = [];
  
  constructor(private auth: AuthService<LocalUser>) {}
  
  ngOnInit(): void {
    this.auth.providers.subscribe(value => {
      this.providers.length = 0;
      this.providers.push(...value);
    });
  }

  goto(provider: AuthProviderInfo): void {
    this.auth.gotoExternalAuthProvider(provider);
  }
}
```
Use the `gotoExternalAuthProvider` method to redirect the user to the external provider and start the oauth flow.
```html
<ng-container *ngIf="providers !== undefined">
  <ng-container *ngFor="let provider of providers">
    <button (click)="goto(provider)">
      {{ provider.name }}
    </button>
    <br/>
  </ng-container>
</ng-container>
```
After the uses successfully logged in with the external provider, 
the user is redirected to the `frontendUiUrl + "/auth/redirect"` url you configured before.
On this page you need to call the `AuthService::handleOAuth2()` function to finish the oauth flow.
```typescript
export class RedirectComponent implements OnInit  {
 constructor(private auth: AuthService<LocalUser>, private router: Router, private activatedRoute: ActivatedRoute) {}

  public ngOnInit(): void {
    this.auth
        .handleOAuth2()
        .subscribe(
          {
            next: (value: RecordAuthResponse<Record>) => this.router.navigate(["/"]),
            error: (reason: ClientResponseError) => alert(reason.message),
          },
        );
  }
}
```
You can alternatively pass the code as a query parameter to the `AuthService::oauth()` function.


## Example Application

This repository contains an [example application](projects/app) that uses the library.
It authenticates the user and then displays a list of users.

To run the example application, you need to start the pocketbase server and then run `yarn run start`.

```bash
cd projects/server && go run server.go serve . &
yarn && yarn run start --project app
```
This will create a user `demo` (`demo@domain.tld`) with password `demo` and a user `admin` (`admin@domain.tld`) with password `admin`.
