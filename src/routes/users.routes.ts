import { Router } from 'express'
import {
  forgotPasswordController,
  getListUsersController,
  loginController,
  resetPasswordController,
  verifyForgotPasswordTokenController,
  editProfileController,
  getMeController,
  getProfileController,
  getUsersByRolesController,
  getStudentsInSameGroupController,
  getCurrentUserInfoController,
  refreshTokenController,
  joinGroupController
} from '~/controllers/users.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  editProfileValidator,
  getUsersByRolesValidator,
  refreshTokenValidator,
  joinGroupValidator
} from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapReqHandler(loginController))
usersRouter.post('/join', accessTokenValidator, joinGroupValidator, wrapReqHandler(joinGroupController))
usersRouter.get('/', paginationValidator, accessTokenValidator, wrapReqHandler(getListUsersController))

usersRouter.post('/forgot-password', forgotPasswordValidator, wrapReqHandler(forgotPasswordController))

usersRouter.get('/verify-code', verifyForgotPasswordTokenValidator, wrapReqHandler(verifyForgotPasswordTokenController))

usersRouter.post('/reset-password', resetPasswordValidator, wrapReqHandler(resetPasswordController))

usersRouter.patch('/edit-profile', accessTokenValidator, editProfileValidator, wrapReqHandler(editProfileController))

usersRouter.get('/me', accessTokenValidator, wrapReqHandler(getMeController))

usersRouter.get('/info', accessTokenValidator, wrapReqHandler(getCurrentUserInfoController))

usersRouter.post('/refresh-token', refreshTokenValidator, wrapReqHandler(refreshTokenController))

usersRouter.get('/profile', accessTokenValidator, wrapReqHandler(getProfileController))

usersRouter.get('/role', accessTokenValidator, getUsersByRolesValidator, wrapReqHandler(getUsersByRolesController))
usersRouter.get('/same-group-students', accessTokenValidator, wrapReqHandler(getStudentsInSameGroupController))

export default usersRouter
