import { Request, Response } from "express";
import { ReviewMember } from "~/models/Request/Review.request";
import { TokenPayload } from "~/models/Request/User.request";
import reviewsServices from "~/services/review.services";
import { ParamsDictionary } from 'express-serve-static-core'
import { REVIEW_MESSAGES } from "~/constants/messages";
export const reviewMemberController = async (
  req: Request<ParamsDictionary, any, ReviewMember>,
  res: Response) => {
  const { reviews } = req.body


  const result = await reviewsServices.reviewMember(reviews)
  return res.json({
    message: REVIEW_MESSAGES.REVIEW_MEMBER_SUCCESSFULLY,
    result
  })
}