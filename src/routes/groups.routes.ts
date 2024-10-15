import { Request, Response, Router } from 'express'
import { createGroupController } from '~/controllers/groups.controller'
import { loginController } from '~/controllers/users.controller'
import { createGroupValidator } from '~/middlewares/groups.middlewares'
import { accessTokenValidator, loginValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const groupsRouter = Router()
groupsRouter.post('/', createGroupValidator, wrapReqHandler(createGroupController))
export default groupsRouter
