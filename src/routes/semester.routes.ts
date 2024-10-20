import { Router } from 'express'
import { getCriteriaBySemesterIdController } from '~/controllers/criteria.controller'
import {
  getAllSemestersController,
  getSemesterByIdController,
  createSemesterController,
  getCurrentPhaseController,
  editSemesterController,
  assignCriteriaToSemesterController,
  getSemesterTimestampController,
  getCurrentSemesterController
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

semesterRouter.get('/current', getCurrentSemester, wrapReqHandler(getCurrentSemesterController))

semesterRouter.get('/:semesterID/timestamp', semesterIdValidator, wrapReqHandler(getSemesterTimestampController))

semesterRouter.get(
  '/current-phase',
  accessTokenValidator,
  getCurrentSemester,
  getCurrentPhase,
  wrapReqHandler(getCurrentPhaseController)
)

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

semesterRouter.get('/:semesterID/criteria', wrapReqHandler(getCriteriaBySemesterIdController))

export default semesterRouter
