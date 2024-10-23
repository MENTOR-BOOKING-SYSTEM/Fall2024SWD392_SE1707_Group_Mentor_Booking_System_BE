import { Router } from 'express'
import { TokenRole } from '~/constants/enums'
import { getAccountsController } from '~/controllers/dashboard.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import { accessTokenValidator, allowRoles } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const dashboardRouter = Router()

dashboardRouter.use(accessTokenValidator)

dashboardRouter.use(allowRoles([TokenRole.Admin]))

dashboardRouter.get('/accounts/:semesterID', paginationValidator, wrapReqHandler(getAccountsController))

export default dashboardRouter
