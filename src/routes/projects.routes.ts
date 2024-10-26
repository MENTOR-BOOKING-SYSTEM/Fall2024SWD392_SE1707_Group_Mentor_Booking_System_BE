import { Request, Router } from 'express'
import { wrap } from 'module'
import {
  getProjectController,
  getProjectDetailController,
  reviewProjectController,
  submitProjectController
} from '~/controllers/projects.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import {
  getProjectDetailValidator,
  getProjectValidator,
  reviewProjectValidator,
  slugValidator,
  submitProjectValidator
} from '~/middlewares/projects.middlewares'
import { getCurrentSemester } from '~/middlewares/semester.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const projectRouter = Router()

projectRouter.use(accessTokenValidator)

projectRouter.get('/detail/:projectID', getProjectDetailValidator, wrapReqHandler(getProjectDetailController))

projectRouter.post('/submit', submitProjectValidator, wrapReqHandler(submitProjectController))

projectRouter.get('/:type', paginationValidator, getProjectValidator, wrapReqHandler(getProjectController))

projectRouter.post(
  '/:slug/review',
  slugValidator,
  reviewProjectValidator,
  getCurrentSemester,
  wrapReqHandler(reviewProjectController)
)

export default projectRouter
