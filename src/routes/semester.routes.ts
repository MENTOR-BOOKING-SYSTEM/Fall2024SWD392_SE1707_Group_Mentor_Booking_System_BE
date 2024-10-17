import { Router } from 'express'
import {
  getAllSemestersController,
  getSemesterByIdController,
  createSemesterController,
  getCurrentPhaseController
} from '~/controllers/semester.controller'
import { getCurrentPhase, getCurrentSemester, semesterIdValidator } from '~/middlewares/semester.middlewares'
import { createSemesterValidator } from '~/middlewares/semester.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const semesterRouter = Router()

semesterRouter.use(accessTokenValidator)

semesterRouter.get('/all', getAllSemestersController)
semesterRouter.get(
  '/current-phase',
  accessTokenValidator,
  getCurrentSemester,
  getCurrentPhase,
  wrapReqHandler(getCurrentPhaseController)
)
semesterRouter.get('/:semesterID', semesterIdValidator, getSemesterByIdController)
semesterRouter.post('/create', accessTokenValidator, createSemesterValidator, wrapReqHandler(createSemesterController))

export default semesterRouter
