import { checkSchema } from 'express-validator'
import { DatabaseTable } from '~/constants/databaseTable'
import HTTP_STATUS from '~/constants/httpStatus'
import { GROUPS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Group from '~/models/schemas/Group.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'
export const createGroupValidator = validate(
  checkSchema({
    groupName: {
      notEmpty: {
        errorMessage: GROUPS_MESSAGES.GROUP_NAME_IS_REQUIRED
      },
      isString: true,
      isLength: {
        options: {
          max: 100,
          min: 10
        },
        errorMessage: GROUPS_MESSAGES.GROUP_NAME_LENGTH_MUST_BE_FROM_1_TO_100
      },
      custom: {
        options: async (value) => {
          const isExist = await databaseService.query<Group[]>(
            `select * from \`${DatabaseTable.Group}\` where groupName = ?`,
            [value]
          )

          if (isExist.length > 0) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.GROUP_NAME_ALREADY_EXIST,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    },
    usersID: {
      isArray: {
        bail: true,
        options: {
          min: 1
        },
        errorMessage: GROUPS_MESSAGES.GROUP_LIST_USER_LENGTH
      },
      notEmpty: {
        errorMessage: GROUPS_MESSAGES.GROUP_LIST_USER_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          const isNonGroup = await databaseService.query<{ email: string }[]>(
            `SELECT u.email FROM User u WHERE EXISTS (SELECT 1 FROM User_Group ug WHERE u.userID = ug.userID) AND u.userID IN (?)`,
            [value]
          )
          if (isNonGroup.length > 0) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: `${GROUPS_MESSAGES.USER_ALREADY_HAS_A_GROUP}: ${isNonGroup.map((item) => item.email + ' ,')}`
            })
          }
        }
      }
    }
  })
)
