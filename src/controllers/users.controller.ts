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
  TokenPayload,
  VerifyForgotPasswordTokenReqQuery
} from '~/models/Request/User.request'

import User from '~/models/schemas/User.schema'
import emailService from '~/services/email.services'
import userService from '~/services/user.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User & { role: TokenRole }
  const result = await userService.login({ user_id: user.userID })

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
      envConfig.frontendUrl + `/verify-code?code=${forgotPasswordToken}`
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
  return res.json({ message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESSFULLY })
}

export const resetPasswordController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { email } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body

  await userService.resetPassword(password, email)

  return res.json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
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

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, { refreshToken: string }>,
  res: Response
) => {
  const { refreshToken } = req.body
  const result = await userService.refreshToken(refreshToken)
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body
  const result = await userService.logout(refreshToken)
  return res.json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS,
    result
  })
}
