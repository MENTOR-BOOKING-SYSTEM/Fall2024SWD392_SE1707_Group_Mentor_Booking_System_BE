import { Router } from 'express'
import { oauthController } from '~/controllers/oauth.controller'
import { getCurrentSemester } from '~/middlewares/semester.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const oauthRouter = Router()

oauthRouter.get('/google/callback', getCurrentSemester, wrapReqHandler(oauthController))

export default oauthRouter
