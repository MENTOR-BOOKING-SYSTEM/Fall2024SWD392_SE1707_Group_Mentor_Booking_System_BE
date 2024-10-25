import { ParamsDictionary } from 'express-serve-static-core'

export interface GetAccountsRequestParams extends ParamsDictionary {
  semesterID: string
}
export interface GetAccountRequestParams extends ParamsDictionary {
  userID: string
  semesterID: string
}
export interface EditAccountRequestParams extends ParamsDictionary {
  userID: string
  semesterID: string
}
export interface CreateAccountReqBody {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  roles: number[]
  avatarUrl: string
}
export interface EditAccountReqBody {
  firstName: string
  lastName: string
  roles: number[]
  avatarUrl: string
}
