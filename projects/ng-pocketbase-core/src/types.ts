import {AuthProviderInfo} from "pocketbase";

/**
 * The basic type for all entities
 * @public
 */
export type BasicType = {
  readonly id: string
}
/**
 * the basic user type
 * @public
 */
export type User = BasicType & {
  username: string,
  emailVisibility: boolean,
  readonly password?: string,
  readonly passwordConfirm?: string,
  readonly oldPassword?: string,
  readonly email?: string,
};
/**
 * The type contains the user data and the login status as well as the available auth providers
 * @public
 */
export type AuthData<U> = { loggedIn: boolean, userData: U, providers: Array<AuthProviderInfo>, isAdmin: boolean };
