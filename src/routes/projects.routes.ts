import { Request, Router } from 'express'
import { wrap } from 'module'
import {
  getProjectController,
  getProjectDetailController,
  reviewProjectController,
  submitProjectController,
  getProjectTechnologiesController,
  getProjectPostController,
  getProjectOwnController,
  getProjectReviewController,
  getProjectGuideController,
  getProjectSprintController,
  getProjectDetailWithAttachmentsController
} from '~/controllers/projects.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import {
  getProjectDetailValidator,
  getProjectValidator,
  reviewProjectValidator,
  slugValidator,
  submitProjectValidator,
  getProjectDetailWithAttachmentsValidator
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

projectRouter.get('/technologies/:slug', wrapReqHandler(getProjectTechnologiesController))
projectRouter.get('/posts/:slug', wrapReqHandler(getProjectPostController))
projectRouter.get('/owners/:slug', wrapReqHandler(getProjectOwnController))
projectRouter.get('/reviewers/:slug', wrapReqHandler(getProjectReviewController))
projectRouter.get('/guides/:slug', wrapReqHandler(getProjectGuideController))
projectRouter.get('/sprints/:slug', wrapReqHandler(getProjectSprintController))
projectRouter.get(
  '/:slug/detail',
  getProjectDetailWithAttachmentsValidator,
  wrapReqHandler(getProjectDetailWithAttachmentsController)
)

export default projectRouter
