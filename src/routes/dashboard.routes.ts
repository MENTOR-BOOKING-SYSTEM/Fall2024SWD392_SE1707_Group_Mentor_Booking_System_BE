import { Router } from 'express'
import { TokenRole } from '~/constants/enums'
import { createAccountController, getAccountsController, getRolesController } from '~/controllers/dashboard.controller'
import { createAccountValidator } from '~/middlewares/dashboard.middleware'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import { accessTokenValidator, allowRoles } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const dashboardRouter = Router()

dashboardRouter.use(accessTokenValidator)

dashboardRouter.use(allowRoles([TokenRole.Admin]))

dashboardRouter.get('/accounts/roles', wrapReqHandler(getRolesController))

dashboardRouter.get('/accounts/:semesterID', paginationValidator, wrapReqHandler(getAccountsController))

dashboardRouter.post('/accounts/:semesterID/create', createAccountValidator, wrapReqHandler(createAccountController))

export default dashboardRouter
