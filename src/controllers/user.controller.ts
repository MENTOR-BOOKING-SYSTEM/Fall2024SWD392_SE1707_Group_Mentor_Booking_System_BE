import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenRole } from '~/constants/enums'
import { USERS_MESSAGES } from '~/constants/messages'
import { LoginReqBody } from '~/schemas/Request/User.request'

import User from '~/schemas/User.schema'
import databaseService from '~/services/database.services'
import userService from '~/services/user.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User & { name: TokenRole }

  const result = await userService.login({ user_id: user.userID, role: user.name })

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
