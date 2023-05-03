import {Injectable}        from "@angular/core";
import {BasicCrud}         from "../../../ng-pocketbase-core/src/services/basic-crud.service";
import {PocketBaseService} from "../../../ng-pocketbase-core/src/services/pocketbase.service";
import {LocalUser}         from "./User";

@Injectable({
  providedIn: 'root'
})
export class UsersService extends BasicCrud<LocalUser> {
  constructor(pb: PocketBaseService) {
    super(pb, "users");

    this.requestRecords();
  }

  createItem(record: Record<string, any>): LocalUser {
    return {
      id: record["id"],
      username: record["username"],
      emailVisibility: record["emailVisibility"],
      email: record["email"],
      avatar: record["avatar"],
      name: record["name"],
    } as LocalUser;
  }
}
