import { Router } from 'express'
import { getAllSemestersController, getSemesterByIdController } from '~/controllers/semester.controller'
import { semesterIdValidator } from '~/middlewares/semester.middlewares'
import { createSemesterController } from '~/controllers/semester.controllers'
import { createSemesterValidator } from '~/middlewares/semester.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const semesterRouter = Router()

semesterRouter.use(accessTokenValidator)

semesterRouter.get('/all', getAllSemestersController)
semesterRouter.get('/:semesterID', semesterIdValidator, getSemesterByIdController)
semesterRouter.post('/create', accessTokenValidator, createSemesterValidator, wrapReqHandler(createSemesterController))

export default semesterRouter
