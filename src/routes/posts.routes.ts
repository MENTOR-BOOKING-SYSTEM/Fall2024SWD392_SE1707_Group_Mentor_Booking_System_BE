import { Router } from 'express';
import { createPostController } from '~/controllers/post.controller';
import { wrapReqHandler } from '~/utils/handler';
import { getPostsController } from '~/controllers/post.controller';

const postsRouter = Router();

postsRouter.post('/create-post', wrapReqHandler(createPostController));
postsRouter.get('/', wrapReqHandler(getPostsController));
export default postsRouter;
