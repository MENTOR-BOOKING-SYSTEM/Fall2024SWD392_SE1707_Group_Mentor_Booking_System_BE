import { Router } from 'express'
import { oauthController } from '~/controllers/oauth.controller'
import { wrapReqHandler } from '~/utils/handler'

const oauthRouter = Router()

oauthRouter.get('/google/callback', wrapReqHandler(oauthController))

export default oauthRouter
