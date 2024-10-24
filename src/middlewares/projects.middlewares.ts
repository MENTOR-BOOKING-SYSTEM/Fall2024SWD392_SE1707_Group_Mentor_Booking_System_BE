import { checkSchema } from 'express-validator'
import { DatabaseTable } from '~/constants/databaseTable'
import HTTP_STATUS from '~/constants/httpStatus'
import { GROUPS_MESSAGES, PROJECTS_MESSAGE, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { databaseCheck } from '~/utils/databaseCheck'
import { validate } from '~/utils/validation'
import { Request } from 'express'
import { TokenPayload } from '~/models/Request/User.request'
import { ColumnID, TokenRole } from '~/constants/enums'
import User from '~/models/schemas/User.schema'
import Project from '~/models/schemas/Project.schema'
import { isNumber } from 'lodash'

export const submitProjectValidator = validate(
  checkSchema({
    projectName: {
      isString: true,
      notEmpty: {
        errorMessage: PROJECTS_MESSAGE.PROJECT_NAME_CAN_NOT_EMPTY
      },
      isLength: {
        options: {
          min: 10,
          max: 100
        }
      },
      custom: {
        options: async (value, { req }) => {
          const [isExist] = await databaseService.query<Project[]>(
            `select * from ${DatabaseTable.Project} where projectName = ?`,
            [value]
          )
          if (isExist) {
            throw new ErrorWithStatus({
              message: PROJECTS_MESSAGE.PROJECT_NAME_ALREADY_EXISTS,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    },
    funcRequirements: {
      isString: true,
      notEmpty: {
        errorMessage: PROJECTS_MESSAGE.FUNCTIONAL_REQUIREMENT_CAN_NOT_EMPTY
      }
    },
    nonFuncRequirements: {
      optional: true,
      isString: true
    },
    context: {
      optional: true,
      isString: true
    },
    actors: {
      isString: true,
      notEmpty: {
        errorMessage: PROJECTS_MESSAGE.ACTORS_IS_REQUIRED
      }
    },
    problems: {
      optional: true,
      isString: true
    },
    technologies: {
      isArray: true,
      // isArray: {
      //   options: { min: 1 },
      //   errorMessage: PROJECTS_MESSAGE.TECHNOLOGY_MUST_BE_AN_ARRAY_WITH_AT_LEAST_1_ELEMENT
      // },
      custom: {
        options: async (value, { req }) => {
          const notExist = await databaseCheck(DatabaseTable.Technology, ColumnID.Technology, value)
          if (notExist.length > 0) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: `${PROJECTS_MESSAGE.TECHNOLOGY_IS_NOT_FOUND} ${notExist.map((item) => item + ' ')} `
            })
          }
        }
      }
    },
    collaborators: {
      isArray: true,
      custom: {
        options: async (value, { req }) => {
          const notExist = await databaseCheck(DatabaseTable.User, ColumnID.User, value)
          if (notExist.length > 0) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: `${USERS_MESSAGES.USER_NOT_FOUND}: ${notExist.map((item) => item + ' ')} `
            })
          }
        }
      }
    },
    type: {
      isString: true,
      notEmpty: true
    },
    mentorID: {
      isArray: true,
      notEmpty: true,
      custom: {
        options: async (value, { req }) => {
          const user = (req as Request).user as User
          const role = (req as Request).decoded_authorization as TokenPayload
          if (
            value.length < 1 &&
            [TokenRole.Student, TokenRole.Business].some((tokenRole) =>
              role.role.some((userRole) => tokenRole === userRole)
            )
          ) {
            throw new ErrorWithStatus({
              message: PROJECTS_MESSAGE.MENTOR_ID_IS_REQUIRED_FOR_STUDENT_OR_BUSINESS_ROLE,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          if (value && value.length > 0 && role.role.includes(TokenRole.Mentor as string)) {
            throw new ErrorWithStatus({
              status: HTTP_STATUS.FORBIDDEN,
              message: PROJECTS_MESSAGE.MENTOR_DOES_NOT_NEED_TO_REQUEST_PROJECT_REVIEW_FROM_OTHER_MENTOR
            })
          }
        }
      }
    },
    groupID: {
      isArray: true,
      custom: {
        options: async (value, { req }) => {
          if (!((req as Request).body.type === 'Group' && value.length > 0 && value.length < 2)) {
            console.log(value)

            throw new ErrorWithStatus({
              message: PROJECTS_MESSAGE.TYPE_GROUP_ONLY_SENT_1_COLLABORATORS,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          const isGroupExist = await databaseService.query<{ groupID: number }[]>(
            `select groupID from \`${DatabaseTable.Group}\` where groupID =?`,
            [value]
          )
          console.log(isGroupExist)

          if (isGroupExist.length < 1) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.GROUP_NOT_FOUND,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
    }
  })
)
export const getProjectValidator = validate(
  checkSchema({
    type: {
      isString: true,
      notEmpty: true,
      custom: {
        options: async (value, { req }) => {
          if (value !== 'all' && value !== 'review' && value !== 'get-submit') {
            throw new ErrorWithStatus({
              message: PROJECTS_MESSAGE.PARAMS_IN_VALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
    }
  })
)
export const getProjectDetailValidator = validate(
  checkSchema({
    projectID: {
      isString: true,
      notEmpty: true,
      custom: {
        options: async (value, { req }) => {
          if (!Number(value)) {
            throw new ErrorWithStatus({
              message: PROJECTS_MESSAGE.PROJECT_ID_INVALID,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
    }
  })
)

export const getProjectDetailWithAttachmentsValidator = checkSchema({
  slug: {
    isString: true,
    notEmpty: {
      errorMessage: PROJECTS_MESSAGE.PROJECT_NAME_CAN_NOT_EMPTY
    },
    custom: {
      options: async (value) => {
        const project = await databaseService.query<Project[]>(
          `SELECT projectID FROM ${DatabaseTable.Project} WHERE slug = ?`,
          [value]
        )
        if (!project) {
          throw new ErrorWithStatus({
            message: PROJECTS_MESSAGE.PROJECT_ID_INVALID,
            status: HTTP_STATUS.NOT_FOUND
          })
        }
      }
    }
  }
})
