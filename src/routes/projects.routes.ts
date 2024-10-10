import { Request, Router } from 'express'
import { submitProjectController } from '~/controllers/projects.controller'
import { submitProjectValidator } from '~/middlewares/projects.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const projectRouter = Router()
projectRouter.post('/submit', accessTokenValidator, submitProjectValidator, wrapReqHandler(submitProjectController))
export default projectRouter
