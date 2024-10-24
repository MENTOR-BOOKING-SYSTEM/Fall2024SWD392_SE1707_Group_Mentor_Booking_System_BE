import { Request, Router } from 'express'
import { wrap } from 'module'
import {
  getProjectController,
  getProjectDetailController,
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
  submitProjectValidator,
  getProjectDetailWithAttachmentsValidator
} from '~/middlewares/projects.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const projectRouter = Router()
projectRouter.get(
  '/detail/:projectID',
  accessTokenValidator,
  getProjectDetailValidator,
  wrapReqHandler(getProjectDetailController)
)
projectRouter.post('/submit', accessTokenValidator, submitProjectValidator, wrapReqHandler(submitProjectController))
projectRouter.get('/:type', accessTokenValidator, paginationValidator, getProjectValidator, wrapReqHandler(getProjectController))
projectRouter.get('/technologies/:slug', accessTokenValidator, wrapReqHandler(getProjectTechnologiesController))
projectRouter.get('/posts/:slug', accessTokenValidator, wrapReqHandler(getProjectPostController))
projectRouter.get('/owners/:slug', accessTokenValidator, wrapReqHandler(getProjectOwnController))
projectRouter.get('/reviewers/:slug', accessTokenValidator, wrapReqHandler(getProjectReviewController))
projectRouter.get('/guides/:slug', accessTokenValidator, wrapReqHandler(getProjectGuideController))
projectRouter.get('/sprints/:slug', accessTokenValidator, wrapReqHandler(getProjectSprintController))
projectRouter.get(
  '/:slug/detail',
  accessTokenValidator,
  getProjectDetailWithAttachmentsValidator,
  wrapReqHandler(getProjectDetailWithAttachmentsController)
)
export default projectRouter
