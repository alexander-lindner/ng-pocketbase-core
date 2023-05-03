import {Component, OnInit, ViewChild}     from "@angular/core";
import {FormControl, NgForm}              from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {LocalUser}                        from "../../User";
import {UsersService}                     from "../../users.service";

@Component(
  {
    selector: "app-users-detail",
    templateUrl: "./users-detail.component.html",
    styleUrls: ["./users-detail.component.scss"],
  },
)
export class UsersDetailComponent implements OnInit {
  @ViewChild(NgForm) userForm: NgForm = {} as NgForm;
  user: LocalUser | undefined;
  public emailVisibility = new FormControl(false);

  constructor(private usersService: UsersService, private router: Router, private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id: string = params.get("id") || "";
      this.usersService.getById(id).subscribe((user: LocalUser) => {
        this.user = user;
        this.emailVisibility.setValue(user.emailVisibility);
      });
    });
  }

  public save(): void {
    const data = new FormData();
    data.set("username", this.userForm.value.username);
    data.set("name", this.userForm.value.name);
    data.set("email", this.userForm.value.email);
    data.set("emailVisibility", this.emailVisibility.getRawValue() + "");


    if (this.user) {
      this.usersService.update(this.user.id, data).subscribe(() => {
        this.router.navigate(["/users"]).then(r => {});
      });
    }
  }
}
