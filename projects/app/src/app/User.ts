import {User} from "../../../ng-pocketbase-core/src/types";

export type LocalUser = User & {
  name: string,
  avatar: string,
}
