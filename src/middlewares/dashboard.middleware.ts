import { checkSchema } from 'express-validator'
import { DatabaseTable } from '~/constants/databaseTable'
import { DASHBOARD_MESSAGES } from '~/constants/messages'
import { ConflictError } from '~/models/Errors'
import { confirmPasswordSchema, passwordSchema } from '~/models/Form'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createAccountValidator = validate(
  checkSchema(
    {
      firstName: {
        isString: {
          errorMessage: DASHBOARD_MESSAGES.FIRST_NAME_TYPE_INVALID
        },
        trim: true,
        optional: true
      },
      lastName: {
        isString: {
          errorMessage: DASHBOARD_MESSAGES.LAST_NAME_TYPE_INVALID
        },
        trim: true,
        optional: true
      },
      username: {
        isString: {
          errorMessage: DASHBOARD_MESSAGES.USERNAME_TYPE_INVALID
        },
        trim: true,
        isLength: {
          errorMessage: DASHBOARD_MESSAGES.USERNAME_LENGTH_INVALID,
          options: { min: 4, max: 50 }
        },
        custom: {
          options: async (value) => {
            const usernameRegex = /^[a-zA-Z][a-zA-Z0-9._]*$/
            if (!usernameRegex.test(value)) {
              throw new Error(DASHBOARD_MESSAGES.USERNAME_FORMAT_INVALID)
            }
            const [username] = await databaseService.query<User[]>(
              `SELECT username FROM ${DatabaseTable.User} WHERE username = ?`,
              [value]
            )
            if (username) {
              throw new ConflictError({ message: DASHBOARD_MESSAGES.USERNAME_ALREADY_EXISTS })
            }
            return true
          }
        }
      },
      email: {
        isEmail: {
          errorMessage: DASHBOARD_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const [email] = await databaseService.query<User[]>(
              `SELECT email FROM ${DatabaseTable.User} WHERE email = ?`,
              [value]
            )
            if (email) {
              throw new ConflictError({ message: DASHBOARD_MESSAGES.EMAIL_ALREADY_EXISTS })
            }
            return true
          }
        }
      },
      avatarUrl: {
        isString: {
          errorMessage: DASHBOARD_MESSAGES.AVATAR_URL_TYPE_INVALID
        },
        optional: true,
        trim: true
      },
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
      roles: {
        isArray: {
          errorMessage: DASHBOARD_MESSAGES.ROLES_TYPE_INVALID
        },
        custom: {
          options: async (value) => {
            if (value.length === 0) {
              throw new Error(DASHBOARD_MESSAGES.ROLES_REQUIRED)
            }
            const roles = await databaseService.query<{ roleID: number; roleName: string }[]>(
              `SELECT roleID FROM ${DatabaseTable.Role} WHERE roleID IN (?)`,
              [value]
            )

            if (roles.length !== value.length) {
              throw new Error(DASHBOARD_MESSAGES.INVALID_ROLE_ID)
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const editAccountValidator = validate(
  checkSchema(
    {
      firstName: {
        isString: {
          errorMessage: DASHBOARD_MESSAGES.FIRST_NAME_TYPE_INVALID
        },
        trim: true,
        optional: true
      },
      lastName: {
        isString: {
          errorMessage: DASHBOARD_MESSAGES.LAST_NAME_TYPE_INVALID
        },
        trim: true,
        optional: true
      },
      avatarUrl: {
        isString: {
          errorMessage: DASHBOARD_MESSAGES.AVATAR_URL_TYPE_INVALID
        },
        optional: true,
        trim: true
      },
      roles: {
        isArray: {
          errorMessage: DASHBOARD_MESSAGES.ROLES_TYPE_INVALID
        },
        custom: {
          options: async (value) => {
            if (value.length === 0) {
              throw new Error(DASHBOARD_MESSAGES.ROLES_REQUIRED)
            }
            const roles = await databaseService.query<{ roleID: number; roleName: string }[]>(
              `SELECT roleID FROM ${DatabaseTable.Role} WHERE roleID IN (?)`,
              [value]
            )

            if (roles.length !== value.length) {
              throw new Error(DASHBOARD_MESSAGES.INVALID_ROLE_ID)
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
