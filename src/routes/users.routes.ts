import { Request, Response, Router } from 'express'
import { loginController } from '~/controllers/user.controller'
import { loginValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const usersRouter = Router()
usersRouter.post('/login', loginValidator, wrapReqHandler(loginController))
export default usersRouter
