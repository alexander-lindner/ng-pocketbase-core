import {Component, OnInit, ViewChild} from "@angular/core";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {LocalUser}                    from "../User";
import {UsersService}                 from "../users.service";

@Component(
  {
    selector: "app-users",
    templateUrl: "./users.component.html",
    styleUrls: ["./users.component.scss"],
  },
)
export class UsersComponent implements OnInit {
  public data: LocalUser[] = [];
  public users: MatTableDataSource<LocalUser, any> = new MatTableDataSource(this.data);
  public columnsToDisplay: string[] = ["id", "username", "email", "emailVisibility", "avatar", "name", "menu"];

  @ViewChild(MatTable) table: MatTable<LocalUser> = {} as MatTable<LocalUser>;

  constructor(private usersService: UsersService) {}

  public ngOnInit(): void {
    this.usersService.items.subscribe((value: Array<LocalUser>) => {
      this.users.data.push(...value);
      this.table.renderRows();
    });
  }

  applyFilter(event: Event) {
    const filterValue: string = (event.target as HTMLInputElement).value;
    this.users.filter = filterValue.trim().toLowerCase();
  }
}
