import { Request, Router } from 'express'
import { wrap } from 'module'
import { getProjectController, getProjectDetailController, submitProjectController, getProjectTechnologiesController, getProjectPostController, getProjectOwnController, getProjectReviewController, getProjectGuideController, getProjectSprintController } from '~/controllers/projects.controller'
import { paginationValidator } from '~/middlewares/pagination.middlewares'
import { getProjectDetailValidator, getProjectValidator, submitProjectValidator } from '~/middlewares/projects.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const projectRouter = Router()
projectRouter.get('/detail/:projectID', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectDetailController))
projectRouter.post('/submit', accessTokenValidator, submitProjectValidator, wrapReqHandler(submitProjectController))
projectRouter.get('/:type', accessTokenValidator, paginationValidator, getProjectValidator, wrapReqHandler(getProjectController))
projectRouter.get('/:projectID/detail', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectDetailController))
projectRouter.get('/:projectID/technologies', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectTechnologiesController))
projectRouter.get('/:projectID/post', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectPostController))
projectRouter.get('/:projectID/own', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectOwnController))
projectRouter.get('/:projectID/review', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectReviewController))
projectRouter.get('/:projectID/guide', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectGuideController))
projectRouter.get('/:projectID/sprint', accessTokenValidator, getProjectDetailValidator, wrapReqHandler(getProjectSprintController))
export default projectRouter
