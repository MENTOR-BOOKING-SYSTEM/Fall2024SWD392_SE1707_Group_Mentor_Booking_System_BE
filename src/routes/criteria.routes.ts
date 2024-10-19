import { Router } from 'express'
import {
  createCriteriaController,
  editCriteriaController,
  getAllCriteriaController,
  getCriteriaByIdController,
  getCriteriaBySemesterIdController,
  getCriteriaTypesController
} from '~/controllers/criteria.controller'
import { criteriaValidator } from '~/middlewares/criteria.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapReqHandler } from '~/utils/handler'

const criteriaRouter = Router()

// Thêm accessTokenValidator vào tất cả các route
criteriaRouter.use(accessTokenValidator)

criteriaRouter.post('/create', criteriaValidator, wrapReqHandler(createCriteriaController))
criteriaRouter.patch('/:criteriaID', criteriaValidator, wrapReqHandler(editCriteriaController))
criteriaRouter.get('/all', wrapReqHandler(getAllCriteriaController))
criteriaRouter.get('/types', wrapReqHandler(getCriteriaTypesController))
criteriaRouter.get('/:criteriaID', wrapReqHandler(getCriteriaByIdController))
criteriaRouter.get('/semester/:semesterID', wrapReqHandler(getCriteriaBySemesterIdController))

export default criteriaRouter
