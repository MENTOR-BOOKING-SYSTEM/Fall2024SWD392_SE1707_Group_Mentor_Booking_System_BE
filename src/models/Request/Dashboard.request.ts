import { ParamsDictionary } from 'express-serve-static-core'

export interface GetAccountRequestParams extends ParamsDictionary {
  semesterID: string
}
