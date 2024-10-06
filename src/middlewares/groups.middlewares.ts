import { checkSchema } from 'express-validator'
import { DatabaseTable } from '~/constants/databaseTable'
import HTTP_STATUS from '~/constants/httpStatus'
import { GROUPS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Group from '~/models/schemas/Group.schema'
import Project, { ProjectType } from '~/models/schemas/Project.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'
import { Request } from 'express'
import { TokenPayload } from '~/models/Request/User.request'
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
          const isExist = await databaseService.query<Group[]>(`select * from \`${DatabaseTable.Group}\` where groupName = ?`, [value])

          if (isExist.length > 0) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.GROUP_NAME_ALREADY_EXIST,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    }
  })
)
