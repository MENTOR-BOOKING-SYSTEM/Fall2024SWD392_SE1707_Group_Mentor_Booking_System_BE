import { Request, Router } from 'express'
import { wrap } from 'module'
import { getProjectController, getProjectDetailController, submitProjectController } from '~/controllers/projects.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import { getProjectDetailValidator, getProjectValidator, submitProjectValidator } from '~/middlewares/projects.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const projectRouter = Router()
projectRouter.get('/detail/:projectID', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectDetailController))
projectRouter.post('/submit', accessTokenValidator, submitProjectValidator, wrapReqHandler(submitProjectController))
projectRouter.get('/:type', accessTokenValidator, paginationValidator, getProjectValidator, wrapReqHandler(getProjectController))

export default projectRouter
