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
