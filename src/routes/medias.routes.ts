import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controller'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'
const mediasRouter = Router()
mediasRouter.post('/upload-image', accessTokenValidator, wrapReqHandler(uploadImageController))
export default mediasRouter
