import { Router } from 'express';
import {
  createPostController,
  getPostsController,
  filterPostsController,
  searchPostsController
} from '~/controllers/post.controller';
import { wrapReqHandler } from '~/utils/handler';

const postsRouter = Router();

postsRouter.post('/', wrapReqHandler(createPostController));
postsRouter.get('/', wrapReqHandler(getPostsController));
postsRouter.get('/filter', wrapReqHandler(filterPostsController)); // Route cho lọc bài đăng
postsRouter.get('/search', wrapReqHandler(searchPostsController)); // Route cho tìm kiếm bài đăng

export default postsRouter;
