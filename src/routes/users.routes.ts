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
  getUsersByRolesController
} from '~/controllers/users.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  editProfileValidator,
  getUsersByRolesValidator
} from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapReqHandler(loginController))

usersRouter.get('/', paginationValidator, accessTokenValidator, wrapReqHandler(getListUsersController))

usersRouter.post('/forgot-password', forgotPasswordValidator, wrapReqHandler(forgotPasswordController))

usersRouter.get('/verify-code', verifyForgotPasswordTokenValidator, wrapReqHandler(verifyForgotPasswordTokenController))

usersRouter.post('/reset-password', resetPasswordValidator, wrapReqHandler(resetPasswordController))

usersRouter.patch('/edit-profile', accessTokenValidator, editProfileValidator, wrapReqHandler(editProfileController))

usersRouter.get('/me', accessTokenValidator, wrapReqHandler(getMeController))

usersRouter.get('/profile', accessTokenValidator, wrapReqHandler(getProfileController))

usersRouter.get('/role', accessTokenValidator, getUsersByRolesValidator, wrapReqHandler(getUsersByRolesController))

export default usersRouter
