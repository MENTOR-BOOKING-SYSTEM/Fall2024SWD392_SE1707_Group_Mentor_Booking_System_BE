import dashboardService from '~/services/dashboard.services'
import { Request, Response } from 'express'
import { DASHBOARD_MESSAGES } from '~/constants/messages'
import { Pagination } from '~/models/Request/Pagination.request'
import { GetAccountRequestParams } from '~/models/Request/Dashboard.request'

export const getAccountsController = async (
  req: Request<GetAccountRequestParams, any, any, Pagination>,
  res: Response
) => {
  const { semesterID } = req.params
  const { limit, page } = req.query
  const accounts = await dashboardService.getAccounts(limit, page, semesterID)

  return res.json({
    message: DASHBOARD_MESSAGES.GET_ACCOUNTS_SUCCESSFULLY,
    result: accounts
  })
}
