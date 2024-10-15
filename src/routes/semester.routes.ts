import { Router } from 'express'
import { createSemesterController, getCurrentPhaseController } from '~/controllers/semester.controllers'
import { createSemesterValidator, getCurrentPhase, getCurrentSemester } from '~/middlewares/semester.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const semesterRouter = Router()
semesterRouter.post('/create', accessTokenValidator, createSemesterValidator, wrapReqHandler(createSemesterController))

semesterRouter.get(
  '/current-phase',
  accessTokenValidator,
  getCurrentSemester,
  getCurrentPhase,
  wrapReqHandler(getCurrentPhaseController)
)

export default semesterRouter
