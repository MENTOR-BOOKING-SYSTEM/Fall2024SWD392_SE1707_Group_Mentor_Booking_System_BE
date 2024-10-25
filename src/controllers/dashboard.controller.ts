import dashboardService from '~/services/dashboard.services'
import { Request, Response } from 'express'
import { DASHBOARD_MESSAGES } from '~/constants/messages'
import { CreateAccountReqBody, GetAccountRequestParams } from '~/models/Request/Dashboard.request'
import { Pagination } from '~/models/Request/Pagination.request'

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

export const getRolesController = async (req: Request, res: Response) => {
  const roles = await dashboardService.getRoles()

  return res.json({
    message: DASHBOARD_MESSAGES.GET_ROLES_SUCCESSFULLY,
    result: roles
  })
}

export const createAccountController = async (
  req: Request<GetAccountRequestParams, any, CreateAccountReqBody>,
  res: Response
) => {
  const { semesterID } = req.params
  const { username, email, password, firstName, lastName, roles, avatarUrl } = req.body

  await dashboardService.createAccount({
    account: { username, email, password, firstName, lastName, roles, avatarUrl },
    semesterID
  })

  return res.json({
    message: DASHBOARD_MESSAGES.CREATE_ACCOUNT_SUCCESSFULLY
  })
}
