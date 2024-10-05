import { Router } from 'express';
import { createPostController } from '~/controllers/post.controller';
import { wrapReqHandler } from '~/utils/handler';

const postsRouter = Router();

postsRouter.post('/create', wrapReqHandler(createPostController));

export default postsRouter;
