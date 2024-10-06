import { Request, Response, Router } from 'express'
import { getListUsersController, loginController } from '~/controllers/users.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import { accessTokenValidator, loginValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const usersRouter = Router()
usersRouter.post('/login', loginValidator, wrapReqHandler(loginController))
usersRouter.get('/', paginationValidator, accessTokenValidator, wrapReqHandler(getListUsersController))
export default usersRouter
