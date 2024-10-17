import { checkSchema } from 'express-validator'
import { DatabaseTable } from '~/constants/databaseTable'
import { TokenRole } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { GROUPS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/Request/User.request'
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
export const getRequestPendingValidator = validate(
  checkSchema(
    {
      groupID: {
        notEmpty: true,
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const isExist = await databaseService.query<{ groupID: string }[]>(
              `select groupID from \`${DatabaseTable.Group}\` where groupID =? `,
              [value]
            )
            console.log(isExist)

            if (!(isExist.length > 0)) {
              throw new ErrorWithStatus({
                message: GROUPS_MESSAGES.GROUP_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
export const removeGroupMemberValidator = validate(
  checkSchema({
    groupID: {
      isNumeric: true,
      notEmpty: true,
      custom: {
        options: async (value, { req }) => {
          const isExist = await databaseService.query<{ groupID: string }[]>(
            `select groupID from \`${DatabaseTable.Group}\` where groupID =? `,
            [value]
          )
          if (!(isExist.length > 0)) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.GROUP_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    },
    userID: {
      isNumeric: true,
      notEmpty: true,
      custom: {
        options: async (value, { req }) => {
          const { user_id } = req.decoded_authorization as TokenPayload
          const [isExist, isLeader] = await Promise.all([
            databaseService.query<{ groupID: string }[]>(
              `select userID from \`${DatabaseTable.User_Group}\` ug join \`${DatabaseTable.Group}\` g on ug.groupID = g.groupID  where userID =? `,
              [value]
            ),
            await databaseService.query<{ position: string }[]>(
              `select ug.position from \`${DatabaseTable.User_Group}\` ug join \`${DatabaseTable.Group}\` g on ug.groupID = g.groupID  where userID =? `,
              [user_id]
            )
          ])

          if (!isLeader.some((item) => item.position === TokenRole.Leader)) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.ONLY_LEADER_CAN_BE_REMOVE_THE_MEMBER,
              status: HTTP_STATUS.FORBIDDEN
            })
          }
          if (!(isExist.length > 0)) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.USER_NOT_EXIST_IN_GROUP,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  })
)
