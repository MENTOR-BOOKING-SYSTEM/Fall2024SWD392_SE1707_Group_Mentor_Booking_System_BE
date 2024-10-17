import { Request, Response, Router } from 'express'
import {
  addUserToGroup,
  createGroupController,
  getRequestPendingController,
  removeGroupMemberController
} from '~/controllers/groups.controller'
import { loginController } from '~/controllers/users.controller'
import {
  addGroupMemberValidator,
  createGroupValidator,
  getRequestPendingValidator,
  removeGroupMemberValidator
} from '~/middlewares/groups.middlewares'
import { accessTokenValidator, loginValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const groupsRouter = Router()
groupsRouter.post('/', accessTokenValidator, createGroupValidator, wrapReqHandler(createGroupController))
groupsRouter.get(
  '/:groupID/request-pending',
  accessTokenValidator,
  getRequestPendingValidator,
  wrapReqHandler(getRequestPendingController)
)
groupsRouter.delete(
  '/remove-member',
  accessTokenValidator,
  removeGroupMemberValidator,
  wrapReqHandler(removeGroupMemberController)
)
groupsRouter.post('/add-member', accessTokenValidator, addGroupMemberValidator, wrapReqHandler(addUserToGroup))
export default groupsRouter
