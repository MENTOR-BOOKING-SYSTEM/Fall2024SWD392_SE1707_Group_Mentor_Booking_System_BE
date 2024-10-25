import dashboardService from '~/services/dashboard.services'
import { Request, Response } from 'express'
import { DASHBOARD_MESSAGES } from '~/constants/messages'
import {
  CreateAccountReqBody,
  EditAccountReqBody,
  EditAccountRequestParams,
  GetAccountRequestParams,
  GetAccountsRequestParams
} from '~/models/Request/Dashboard.request'
import { Pagination } from '~/models/Request/Pagination.request'
import { ParamsDictionary } from 'express-serve-static-core'

export const getAccountsController = async (
  req: Request<GetAccountsRequestParams, any, any, Pagination>,
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
  req: Request<GetAccountsRequestParams, any, CreateAccountReqBody>,
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

export const getAccountController = async (
  req: Request<GetAccountRequestParams, any, CreateAccountReqBody>,
  res: Response
) => {
  const { userID, semesterID } = req.params
  const account = await dashboardService.getAccount(semesterID, userID)

  return res.json({
    message: DASHBOARD_MESSAGES.GET_ACCOUNT_SUCCESSFULLY,
    result: account
  })
}

export const editAccountController = async (
  req: Request<EditAccountRequestParams, any, EditAccountReqBody>,
  res: Response
) => {
  const { semesterID, userID } = req.params
  const { firstName, lastName, roles, avatarUrl } = req.body

  await dashboardService.editAccount({
    account: { firstName, lastName, roles, avatarUrl },
    semesterID,
    userID
  })

  return res.json({
    message: DASHBOARD_MESSAGES.EDIT_ACCOUNT_SUCCESSFULLY
  })
}
