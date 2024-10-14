import { Router } from 'express';
import { createCriteriaController, getAllCriteriaController } from '~/controllers/criteria.controller';
import { createCriteriaValidator } from '~/middlewares/criteria.middlewares';
import { wrapReqHandler } from '~/utils/handler';

const criteriaRouter = Router();

criteriaRouter.post('/', createCriteriaValidator, wrapReqHandler(createCriteriaController));
criteriaRouter.get('/', wrapReqHandler(getAllCriteriaController));

export default criteriaRouter;

