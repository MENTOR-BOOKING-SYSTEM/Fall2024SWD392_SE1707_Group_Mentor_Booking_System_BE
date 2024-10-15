import { Request, Response, Router } from 'express'
import { getTechnologiesController } from '~/controllers/technologies.controller'
import { loginController } from '~/controllers/users.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import { accessTokenValidator, loginValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'
import { getTechnologiesByProjectIdController } from '~/controllers/technologies.controller'

const technologyRouter = Router()
technologyRouter.get('/', accessTokenValidator, paginationValidator, wrapReqHandler(getTechnologiesController))
technologyRouter.get('/project/:projectId', accessTokenValidator, wrapReqHandler(getTechnologiesByProjectIdController))
export default technologyRouter
