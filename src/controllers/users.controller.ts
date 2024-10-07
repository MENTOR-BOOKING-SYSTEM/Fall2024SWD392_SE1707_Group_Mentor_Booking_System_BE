import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { readFileSync } from 'fs'
import { envConfig } from '~/constants/config'
import { TokenRole } from '~/constants/enums'
import { EMAIL_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import {
  ForgotPasswordReqBody,
  GetUserListQuery,
  LoginReqBody,
  VerifyForgotPasswordTokenReqQuery
} from '~/models/Request/User.request'

import User from '~/models/schemas/User.schema'
import emailService from '~/services/email.services'
import userService from '~/services/user.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User & { name: TokenRole }

  const result = await userService.login({ user_id: user.userID, role: user.name })

  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { email } = req.body
  const forgotPasswordToken = await userService.forgotPassword(email)

  emailService.sendEmail({
    to: [req.body.email],
    subject: EMAIL_MESSAGES.RESET_PASSWORD_EMAIL_SUBJECT,
    body: readFileSync('src/templates/reset-password.html', 'utf8').replace(
      '{{resetPasswordLink}}',
      envConfig.backendUrl + `/verify-code?code=${forgotPasswordToken}`
    )
  })

  return res.json({
    message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
  })
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, any, VerifyForgotPasswordTokenReqQuery>,
  res: Response
) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESSFULLY
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
