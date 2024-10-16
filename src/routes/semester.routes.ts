import { Router } from 'express'
import { getAllSemestersController, getSemesterByIdController, createSemesterController, getCurrentPhaseController, editSemesterController } from '~/controllers/semester.controller'
import { getCurrentPhase, getCurrentSemester, semesterIdValidator } from '~/middlewares/semester.middlewares'
import { createSemesterValidator, editSemesterValidator } from '~/middlewares/semester.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const semesterRouter = Router()

semesterRouter.use(accessTokenValidator)

semesterRouter.get('/all', getAllSemestersController)
semesterRouter.get('/:semesterID', semesterIdValidator, getSemesterByIdController)
semesterRouter.post('/create', accessTokenValidator, createSemesterValidator, wrapReqHandler(createSemesterController))
semesterRouter.patch(
  '/:semesterID',
  accessTokenValidator,
  semesterIdValidator,
  editSemesterValidator,
  wrapReqHandler(editSemesterController)
)

semesterRouter.get(
  '/current-phase',
  accessTokenValidator,
  getCurrentSemester,
  getCurrentPhase,
  wrapReqHandler(getCurrentPhaseController)
)


export default semesterRouter
