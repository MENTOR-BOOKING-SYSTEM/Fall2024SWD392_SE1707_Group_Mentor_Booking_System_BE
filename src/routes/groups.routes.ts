import { Request, Response, Router } from 'express'
import { createGroupController, getRequestPendingController } from '~/controllers/groups.controller'
import { loginController } from '~/controllers/users.controller'
import { createGroupValidator, getRequestPendingValidator } from '~/middlewares/groups.middlewares'
import { accessTokenValidator, loginValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const groupsRouter = Router()
groupsRouter.post('/', accessTokenValidator, createGroupValidator, wrapReqHandler(createGroupController))
groupsRouter.get('/:groupID/request-pending', accessTokenValidator, getRequestPendingValidator, wrapReqHandler(getRequestPendingController))
export default groupsRouter
