import { Router } from 'express'
import { getAllTimestampsController } from '~/controllers/timestamp.controller'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const timestampRouter = Router()

timestampRouter.use(accessTokenValidator)

timestampRouter.get('/all', wrapReqHandler(getAllTimestampsController))

export default timestampRouter
