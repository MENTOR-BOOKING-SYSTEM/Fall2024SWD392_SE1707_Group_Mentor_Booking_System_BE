import { DatabaseTable } from '~/constants/databaseTable'
import databaseService from './database.services'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { Review } from '~/models/schemas/Review.schema'
import { ReviewMember } from '~/models/Request/Review.request'

class ReviewsServices {
  async reviewMember(reviews: ReviewMember['reviews']) {
    const arrayReviews = reviews.map((item) =>
      databaseService.query(
        `Insert into \`${DatabaseTable.Review}\`(reviewID,rate,description,receiverID,createdAt,updatedAt) values(?,?,?,?,?,?)`,
        handleSpreadObjectToArray(new Review({ ...item }))
      )
    )
    const result = await Promise.all(arrayReviews)
    return result
  }
}
const reviewsServices = new ReviewsServices()
export default reviewsServices
