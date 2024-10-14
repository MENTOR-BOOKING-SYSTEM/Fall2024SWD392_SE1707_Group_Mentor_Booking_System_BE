import { Router } from 'express';
import { createCriteriaController, getAllCriteriaController, getCriteriaByIdController } from '~/controllers/criteria.controller';
import { createCriteriaValidator } from '~/middlewares/criteria.middlewares';
import { wrapReqHandler } from '~/utils/handler';

const criteriaRouter = Router();

criteriaRouter.post('/', createCriteriaValidator, wrapReqHandler(createCriteriaController));
criteriaRouter.get('/all', wrapReqHandler(getAllCriteriaController));
criteriaRouter.get('/:criteriaID', wrapReqHandler(getCriteriaByIdController));

export default criteriaRouter;
