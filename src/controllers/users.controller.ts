import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenRole } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import { GetUserListQuery, LoginReqBody } from '~/models/Request/User.request'

import User from '~/models/schemas/User.schema'
import userService from '~/services/user.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User & { role: TokenRole }
  const result = await userService.login({ user_id: user.userID })

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
export const getListUsersController = async (
  req: Request<ParamsDictionary, any, any, GetUserListQuery>,
  res: Response
) => {
  const nonGroup = req.query.nonGroup
  const users = await userService.getListUser({ nonGroup })
  const result = users.map(({ password, forgotPasswordToken, ...rest }) => rest)
  return res.json({
    message: USERS_MESSAGES.GET_USER_LIST_SUCCESSFULLY,
    result
  })
}
