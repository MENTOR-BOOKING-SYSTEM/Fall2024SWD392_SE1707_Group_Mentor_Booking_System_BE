import { ParamsDictionary } from 'express-serve-static-core'

export interface GetAccountRequestParams extends ParamsDictionary {
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
