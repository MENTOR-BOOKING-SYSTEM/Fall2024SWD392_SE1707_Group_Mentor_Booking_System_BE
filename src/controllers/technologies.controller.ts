import { Request, Response } from 'express'
import { TECHNOLOGIES_MESSAGE, USERS_MESSAGES } from '~/constants/messages'
import { Pagination } from '~/models/Request/Pagination.request'
import technologyServices from '~/services/technology.services'
import { ParamsDictionary } from 'express-serve-static-core'
export const getTechnologiesController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response
) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await technologyServices.getTechnologies(limit, page)
  return res.json({
    message: TECHNOLOGIES_MESSAGE.GET_TECHNOLOGIES_SUCCESSFULLY,
    result
  })
}