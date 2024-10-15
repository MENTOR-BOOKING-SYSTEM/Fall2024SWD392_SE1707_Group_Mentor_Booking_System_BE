import { Router } from 'express'
import { createSemesterController } from '~/controllers/semester.controllers'
import { createSemesterValidator } from '~/middlewares/semester.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const semesterRouter = Router()
semesterRouter.post('/create', accessTokenValidator, createSemesterValidator, wrapReqHandler(createSemesterController))

export default semesterRouter
