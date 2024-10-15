import { Router } from 'express'
import {
  createCriteriaController,
  getAllCriteriaController,
  getCriteriaByIdController,
  getCriteriaBySemesterIdController
} from '~/controllers/criteria.controller'
import { createCriteriaValidator } from '~/middlewares/criteria.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const criteriaRouter = Router()

// Thêm accessTokenValidator vào tất cả các route
criteriaRouter.use(accessTokenValidator)

criteriaRouter.post('/', createCriteriaValidator, wrapReqHandler(createCriteriaController))
criteriaRouter.get('/all', wrapReqHandler(getAllCriteriaController))
criteriaRouter.get('/:criteriaID', wrapReqHandler(getCriteriaByIdController))
criteriaRouter.get('/semester/:semesterID', wrapReqHandler(getCriteriaBySemesterIdController))

export default criteriaRouter
