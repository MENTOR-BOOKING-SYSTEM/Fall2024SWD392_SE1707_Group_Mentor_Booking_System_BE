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
  getProjectSprintController
} from '~/controllers/projects.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import {
  getProjectDetailValidator,
  getProjectValidator,
  submitProjectValidator
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
projectRouter.get('/technologies/:projectID', accessTokenValidator, wrapReqHandler(getProjectTechnologiesController))
projectRouter.get('/posts/:projectID', accessTokenValidator, wrapReqHandler(getProjectPostController))
projectRouter.get('/owners/:projectID', accessTokenValidator, wrapReqHandler(getProjectOwnController))
projectRouter.get('/reviewers/:projectID', accessTokenValidator, wrapReqHandler(getProjectReviewController))
projectRouter.get('/guides/:projectID', accessTokenValidator, wrapReqHandler(getProjectGuideController))
projectRouter.get('/sprints/:projectID', accessTokenValidator, wrapReqHandler(getProjectSprintController))
export default projectRouter
