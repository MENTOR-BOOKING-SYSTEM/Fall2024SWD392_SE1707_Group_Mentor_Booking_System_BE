import { DatabaseTable } from '~/constants/databaseTable'
import databaseService from './database.services'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { Review } from '~/models/schemas/Review.schema'
import { ReviewMember } from '~/models/Request/Review.request'
import { PROJECTS_MESSAGE } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { REVIEW_MESSAGES } from '~/constants/messages'

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

  async assignReviewer(semesterID: number, userIDs: number[]) {
    // Lấy projectID từ bảng Project_Semester dựa vào semesterID
    const projects = await databaseService.query<{projectID: number}[]>(
      `SELECT projectID FROM ${DatabaseTable.Project_Semester} WHERE semesterID = ?`,
      [semesterID]
    )

    if (!projects.length) {
      throw new ErrorWithStatus({
        message: PROJECTS_MESSAGE.PROJECT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const projectID = projects[0].projectID

    // Kiểm tra xem tất cả userIDs có tồn tại trong bảng User không
    const users = await databaseService.query<{userID: number}[]>(
      `SELECT userID FROM ${DatabaseTable.User} WHERE userID IN (?)`,
      [userIDs]
    )

    if (users.length !== userIDs.length) {
      // Tìm ra những userID không tồn tại
      const existingUserIds = users.map(user => user.userID)
      const nonExistentUserIds = userIDs.filter(id => !existingUserIds.includes(id))
      
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USERS_NOT_FOUND + `: ${nonExistentUserIds.join(', ')}`,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Kiểm tra xem user đã được assign làm reviewer cho project này chưa
    const existingReviewers = await databaseService.query<{userID: number}[]>(
      `SELECT userID FROM ${DatabaseTable.User_Review_Project} WHERE projectID = ? AND userID IN (?)`,
      [projectID, userIDs]
    )

    if (existingReviewers.length > 0) {
      const existingReviewerIds = existingReviewers.map(reviewer => reviewer.userID)
      throw new ErrorWithStatus({
        message: REVIEW_MESSAGES.USERS_ALREADY_REVIEWERS + `: ${existingReviewerIds.join(', ')}`,
        status: HTTP_STATUS.CONFLICT
      })
    }

    const arrayAssignReviewer = userIDs.map((userID) =>
      databaseService.query(
        `INSERT INTO ${DatabaseTable.User_Review_Project} (userID, projectID, type, status) VALUES (?, ?, ?, ?)`,
        [userID, projectID, 'Reviewer', 'Pending']
      )
    )
    const result = await Promise.all(arrayAssignReviewer)
    return result
  }
}
const reviewsServices = new ReviewsServices()
export default reviewsServices
