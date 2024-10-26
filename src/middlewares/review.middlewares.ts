import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { DatabaseTable } from '~/constants/databaseTable'
import HTTP_STATUS from '~/constants/httpStatus'
import { REVIEW_MESSAGES } from '~/constants/messages'

import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/Request/User.request'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const reviewMemberValidator = validate(
  checkSchema({
    // reviews: {
    //   isArray: true,
    //   custom: {
    //     options: async (value, { req }) => {
    //       const { user_id } = (req as Request).decoded_authorization as TokenPayload
    //       const listUserInGroup = await databaseService.query<{ userID: string }[]>(
    //         `select * from ${DatabaseTable.User_Group} ug1 JOIN ${DatabaseTable.User_Group} ug2 ON ug1.groupID = ug2.groupID WHERE ug1.userID = ? AND ug2.userID != ?`,
    //         [user_id, user_id]
    //       )
    //       if ((req.body.reviews as ReviewType[]).length !== listUserInGroup.length) {
    //         throw new ErrorWithStatus({
    //           message: REVIEW_MESSAGES.SUBMIT_FULL_MEMBER_REVIEW,
    //           status: HTTP_STATUS.BAD_REQUEST
    //         })
    //       }
    //     }
    //   }
    // },
    'reviews.*.rate': {
      isNumeric: true,
      custom: {
        options: (value, { req }) => {
          if (!(value <= 5 && value >= 1)) {
            throw new ErrorWithStatus({
              message: REVIEW_MESSAGES.RATE_MUST_BE_LESS_THAN_5_AND_MORE_THAN_1,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    },
    'reviews.*.description': {
      isString: true,
      isLength: {
        options: {
          max: 200,
          min: 10
        }
      }
    },
    'reviews.*.receiverID': {
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const { user_id } = (req as Request).decoded_authorization as TokenPayload
          const [receiverGroup, senderGroup] = await Promise.all([
            databaseService.query<{ groupID: number }[]>(
              `select up.groupID from ${DatabaseTable.User} u join ${DatabaseTable.User_Group} up on u.userID =up.userID where u.userID =?`,
              [value]
            ),
            databaseService.query<{ groupID: number }[]>(
              `select up.groupID from ${DatabaseTable.User} u join ${DatabaseTable.User_Group} up on u.userID =up.userID where u.userID =?`,
              [user_id]
            )
          ])
          if (receiverGroup[0].groupID !== senderGroup[0].groupID) {
            throw new ErrorWithStatus({
              message: REVIEW_MESSAGES.USER_DIFFERENT_GROUP,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }

          if (value === user_id) {
            throw new ErrorWithStatus({
              message: REVIEW_MESSAGES.YOU_CAN_NOT_REVIEW_YOURSELF,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
    }
  })
)

export const assignReviewerValidator = validate(
  checkSchema({
    semesterID: {
      notEmpty: {
        errorMessage: REVIEW_MESSAGES.SEMESTER_ID_REQUIRED
      },
      isNumeric: true
    },
    userIDs: {
      notEmpty: {
        errorMessage: REVIEW_MESSAGES.USER_IDS_REQUIRED
      },
      isArray: {
        errorMessage: REVIEW_MESSAGES.USER_IDS_MUST_BE_ARRAY
      }
    }
  })
)
