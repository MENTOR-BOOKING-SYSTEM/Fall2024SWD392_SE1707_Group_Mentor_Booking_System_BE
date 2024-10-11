import { Request, Response, Router } from 'express'
import { getTechnologiesController } from '~/controllers/technologies.controller'
import { loginController } from '~/controllers/users.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import { accessTokenValidator, loginValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const technologyRouter = Router()
technologyRouter.get('/', accessTokenValidator, paginationValidator, wrapReqHandler(getTechnologiesController))
export default technologyRouter
