import {AuthProviderInfo} from "pocketbase";

export type BasicType = {
  readonly id: string
}
export type User = BasicType & {
  username: string,
  emailVisibility: boolean,
  readonly  password?: string,
  readonly  passwordConfirm?: string,
  readonly  oldPassword?: string,
  readonly email?: string,
};
export type AuthData<U> = { loggedIn: boolean, userData: U, providers: Array<AuthProviderInfo>, isAdmin: boolean };
