import { ParamsDictionary } from 'express-serve-static-core'
export interface Pagination extends ParamsDictionary {
  limit: string
  page: string
}
