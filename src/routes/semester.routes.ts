import { Router } from 'express'
import {
  getAllSemestersController,
  getSemesterByIdController,
  createSemesterController,
  getCurrentPhaseController,
  assignCriteriaToSemesterController
} from '~/controllers/semester.controller'
import { getCurrentPhase, getCurrentSemester, semesterIdValidator, assignCriteriaValidator } from '~/middlewares/semester.middlewares'
import { createSemesterValidator } from '~/middlewares/semester.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const semesterRouter = Router()

semesterRouter.use(accessTokenValidator)

semesterRouter.get('/all', getAllSemestersController)
semesterRouter.get('/:semesterID', semesterIdValidator, getSemesterByIdController)
semesterRouter.post('/create', accessTokenValidator, createSemesterValidator, wrapReqHandler(createSemesterController))
semesterRouter.post(
  '/assign-criteria',
  accessTokenValidator,
  assignCriteriaValidator,
  wrapReqHandler(assignCriteriaToSemesterController)
)

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
