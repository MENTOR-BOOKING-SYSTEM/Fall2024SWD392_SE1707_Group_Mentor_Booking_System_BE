import { Router } from 'express'
import usersRouter from './users.routes'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { reviewMemberValidator } from '~/middlewares/review.middlewares'
import { wrapReqHandler } from '~/utils/handler'
import { reviewMemberController } from '~/controllers/reviews.controller'
import { assignReviewerValidator } from '~/middlewares/review.middlewares'
import { assignReviewerController } from '~/controllers/reviews.controller'

const reviewsRouter = Router()
reviewsRouter.post(
  '/review-member',
  accessTokenValidator,
  reviewMemberValidator,
  wrapReqHandler(reviewMemberController)
)
reviewsRouter.post(
  '/assign-reviewer',
  accessTokenValidator,
  assignReviewerValidator,
  wrapReqHandler(assignReviewerController)
)
export default reviewsRouter
