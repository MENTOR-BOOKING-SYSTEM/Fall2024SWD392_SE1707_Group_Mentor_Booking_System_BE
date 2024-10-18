import { Router } from 'express'
import {
  getAllSemestersController,
  getSemesterByIdController,
  createSemesterController,
  getCurrentPhaseController,
  editSemesterController,
  assignCriteriaToSemesterController,
  getSemesterTimestampController
} from '~/controllers/semester.controller'
import {
  getCurrentPhase,
  getCurrentSemester,
  semesterIdValidator,
  assignCriteriaValidator,
  editSemesterValidator,
  createSemesterValidator
} from '~/middlewares/semester.middlewares'
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
semesterRouter.get('/:semesterID/timestamp', semesterIdValidator, wrapReqHandler(getSemesterTimestampController))
semesterRouter.get('/:semesterID', semesterIdValidator, getSemesterByIdController)
semesterRouter.post('/create', accessTokenValidator, createSemesterValidator, wrapReqHandler(createSemesterController))

semesterRouter.post(
  '/assign-criteria',
  accessTokenValidator,
  assignCriteriaValidator,
  wrapReqHandler(assignCriteriaToSemesterController)
)
semesterRouter.patch(
  '/:semesterID',
  accessTokenValidator,
  semesterIdValidator,
  editSemesterValidator,
  wrapReqHandler(editSemesterController)
)

export default semesterRouter
