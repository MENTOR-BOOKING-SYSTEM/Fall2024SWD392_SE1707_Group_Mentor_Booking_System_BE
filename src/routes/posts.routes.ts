import { Router } from 'express'
import { createPostController, getPostsController, getPostDetailController } from '~/controllers/post.controller'
import { wrapReqHandler } from '~/utils/handler'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const postsRouter = Router()

// Thêm accessTokenValidator làm middleware cho tất cả các route
postsRouter.use(accessTokenValidator)

postsRouter.post('/', wrapReqHandler(createPostController))
postsRouter.get('/', wrapReqHandler(getPostsController))
postsRouter.get('/all', wrapReqHandler(getPostsController))
postsRouter.get('/:postID', wrapReqHandler(getPostDetailController))

export default postsRouter
