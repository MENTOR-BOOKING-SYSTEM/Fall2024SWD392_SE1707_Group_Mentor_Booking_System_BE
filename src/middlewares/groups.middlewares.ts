import { isSameSecond } from 'date-fns'
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { forEach, isString } from 'lodash'
import { DatabaseTable } from '~/constants/databaseTable'
import { TokenRole } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { GROUPS_MESSAGES } from '~/constants/messages'
import { AuthError, ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/Request/User.request'
import Group from '~/models/schemas/Group.schema'
import User from '~/models/schemas/User.schema'
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
export const addGroupMemberValidator = validate(
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
      isArray: true,
      notEmpty: true,
      custom: {
        options: async (value, { req }) => {
          const { user_id } = req.decoded_authorization as TokenPayload
          const arrayFindUser = value.map((item: number) =>
            databaseService.query<{ groupID: string }[]>(
              `select ug.userID from \`${DatabaseTable.User_Group}\` ug join \`${DatabaseTable.Group}\` g on ug.groupID = g.groupID  where ug.userID =? and not ug.groupID =? `,
              [item, req.body.groupID]
            )
          )
          const arrayFindUserInGroup = value.map((item: number) =>
            databaseService.query<{ userID: number; position: string }[]>(
              `select ug.userID,ug.position from \`${DatabaseTable.User_Group}\` ug join \`${DatabaseTable.Group}\` g on ug.groupID = g.groupID  where ug.userID =? and ug.groupID =? `,
              [item, req.body.groupID]
            )
          )

          const [[isExist], isLeader, isExistInGroup] = await Promise.all([
            Promise.all(arrayFindUser),
            await databaseService.query<{ position: string }[]>(
              `select ug.position from \`${DatabaseTable.User_Group}\` ug join \`${DatabaseTable.Group}\` g on ug.groupID = g.groupID  where userID =? `,
              [user_id]
            ),
            Promise.all(arrayFindUserInGroup)
          ])
          const groupMemberExist = isExistInGroup
            .flat()
            .filter((item: { position: string }) => item.position !== 'Proposal')
          // groupMemberExist.
          if (groupMemberExist.length > 0) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.USER_ALREADY_EXIST_IN_THIS_GROUP,
              status: HTTP_STATUS.BAD_REQUEST,
              data: groupMemberExist
            })
          }
          if (!isLeader.some((item) => item.position === TokenRole.Leader)) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.ONLY_LEADER_CAN_BE_ADD_THE_MEMBER,
              status: HTTP_STATUS.FORBIDDEN
            })
          }
          if (isExist.length > 0) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.USER_ALREADY_HAS_A_GROUP,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  })
)

export const isGroupLeader = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.decoded_authorization as TokenPayload
    const semesterID = req.currentSemester?.semesterID as string
    const [user] = await databaseService.query<User[]>(
      `
      SELECT u.userID FROM ${DatabaseTable.User} AS u 
      JOIN ${DatabaseTable.User_Group} AS ug ON u.userID = ug.userID 
      JOIN \`${DatabaseTable.Group}\` AS \`g\` ON ug.groupID = \`g\`.groupID 
      WHERE \`g\`.semesterID = ? AND ug.position = '${TokenRole.Leader}' AND u.userID = ?
      `,
      [semesterID, user_id]
    )
    if (!user) {
      throw new AuthError({ message: GROUPS_MESSAGES.ONLY_LEADER_CAN_PERFORM_THIS_ACTION })
    }
    next()
  } catch (error) {
    next(error)
  }
}
export const assignLeaderValidator = validate(
  checkSchema({
    groupID: {
      isNumeric: true,
      notEmpty: true,
      custom: {
        options: async (value, { req }) => {
          const isExist = await databaseService.query<{ groupID: number }[]>(
            `select groupID from \`${DatabaseTable.Group}\`where groupID = ?`,
            [value]
          )
          console.log(isExist)

          if (!(isExist.length > 0)) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.GROUP_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
        }
      }
    },
    userID: {
      isNumeric: true,
      notEmpty: true,
      custom: {
        options: async (value, { req }) => {
          const { user_id } = req.decoded_authorization as TokenPayload
          const leaderInGroup = await databaseService.query<{ userID: number; position: string }[]>(
            `select userID,position from ${DatabaseTable.User_Group} where userID =? and groupID =?`,
            [user_id, req.body.groupID]
          )
          const notALeader = leaderInGroup.filter((item) => item.position !== 'Leader')
          if (notALeader.length > 0) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.ONLY_LEADER_CAN_BE_ASSIGN,
              status: HTTP_STATUS.FORBIDDEN
            })
          }

          const userInGroup = await databaseService.query<{ userID: number; position: string }[]>(
            `select userID,position from ${DatabaseTable.User_Group} where userID =? AND groupID =?`,
            [value, req.body.groupID]
          )
          if (userInGroup.length === 0) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.USER_NOT_EXIST_IN_GROUP,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const alreadyLeader = userInGroup.filter((item) => item.position === 'Leader')
          if (alreadyLeader.length > 0) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.YOU_ALREADY_IS_A_LEADER,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
    }
  })
)
export const getListUserFromGroupValidator = validate(checkSchema({
  groupID: {
    isString: true,
    custom: {
      options: async (value, { req }) => {
        const isExist = await databaseService.query<{ groupID: string }[]>(`select groupID from \`${DatabaseTable.Group}\` where groupID = ?`, [value])
        if (isExist.length < 1) {
          throw new ErrorWithStatus({
            message: GROUPS_MESSAGES.GROUP_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
      }
    }
  }

}))