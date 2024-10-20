import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { readFileSync } from 'fs'
import { envConfig } from '~/constants/config'
import { TokenRole } from '~/constants/enums'
import { EMAIL_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import {
  ForgotPasswordReqBody,
  GetUserListQuery,
  JoinGroupReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  TokenPayload,
  VerifyForgotPasswordTokenReqQuery
} from '~/models/Request/User.request'
import Semester from '~/models/schemas/Semester.schema'

import User from '~/models/schemas/User.schema'
import emailService from '~/services/email.services'
import userService from '~/services/user.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const semester = req.currentSemester as Semester
  const user = req.user as User & { role: TokenRole }
  const result = await userService.login({ user_id: user.userID, semesterID: Number(semester.semesterID as string) })

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
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refreshToken } = req.body

  const { user_id, exp, role } = req.decoded_refresh_token as TokenPayload
  const result = await userService.refreshToken({ user_id, refreshToken, role, exp })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
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

export const editProfileController = async (
  req: Request<ParamsDictionary, any, { firstName?: string; lastName?: string; avatarUrl?: string }>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { firstName, lastName, avatarUrl } = req.body
  const result = await userService.updateProfile(user_id, { firstName, lastName, avatarUrl })
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  })
}

export const getProfileController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getProfile(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const getUsersByRolesController = async (req: Request, res: Response) => {
  const rolesJson = req.query.role as string;
  const roles = JSON.parse(rolesJson);
  const semesterID = req.currentSemester?.semesterID ?? '';
  const users = await userService.getUsersByRoles(roles, semesterID);
  return res.json({
    message: USERS_MESSAGES.GET_USER_LIST_SUCCESSFULLY,
    result: users
  })
}

export const getCurrentUserInfoController = async (req: Request, res: Response) => {
  const { user_id, role } = req.decoded_authorization as TokenPayload
  const info = await userService.getInfo(user_id, role)
  return res.json({
    message: USERS_MESSAGES.SUCCESS,
    result: info
  })
}

export const getStudentsInSameGroupController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const semesterID = req.currentSemester?.semesterID as string
  const students = await userService.getStudentsInSameGroup(user_id, semesterID)
  return res.json({
    message: USERS_MESSAGES.GET_STUDENTS_IN_SAME_GROUP_SUCCESS,
    result: students
  })
}
export const joinGroupController = async (req: Request<ParamsDictionary, any, JoinGroupReqBody>, res: Response) => {
  const { groupId } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.joinGroup({ groupID: groupId, userID: Number(user_id) })
  return res.json({
    message: USERS_MESSAGES.JOIN_GROUP_SUCCESSFULLY,
    result
  })
}
export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refreshToken } = req.body
  const result = await userService.logout(refreshToken)
  return res.json(result)
}
