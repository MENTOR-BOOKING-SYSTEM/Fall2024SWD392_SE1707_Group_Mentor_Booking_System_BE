import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ERROR_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { NotFoundError } from '~/models/Errors'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { verifyTokenByType } from '~/utils/commons'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validation'
export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            const decoded_access_token = await verifyTokenByType(access_token, 'access_token', req as Request)
            if (decoded_access_token) {
              return true
            }
          }
        }
      }
    },
    ['headers']
  )
)
const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  }
}
export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const [user] = await databaseService.query<User & { role: string }[]>(
              'SELECT * FROM User u JOIN User_Role ur ON u.userID = ur.userID JOIN Role r ON ur.roleID = r.roleID WHERE (u.email = ? OR u.username = ?) AND u.password = ?',
              [value, value, req.body.password]
            )
            if (!user) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const [email] = await databaseService.query<User[]>('SELECT email FROM User WHERE email = ?', [value])
            if (!email) {
              throw new NotFoundError({ message: ERROR_MESSAGES.NOT_FOUND })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      code: {
        custom: {
          options: async (value, { req }) => {
            try {
              const decoded_forgot_password_token = await verifyTokenByType(value, 'forgot_password_token')
              const [user] = await databaseService.query<User[]>(
                'SELECT email, forgotPasswordToken FROM User WHERE email = ?',
                [decoded_forgot_password_token.email]
              )
              if (!user.email) {
                throw new NotFoundError({ message: ERROR_MESSAGES.NOT_FOUND })
              }
              if (user.forgotPasswordToken !== value) {
                throw new Error(ERROR_MESSAGES.BAD_REQUEST)
              }
              return true
            } catch (error) {
              throw new Error(ERROR_MESSAGES.BAD_REQUEST)
            }
          }
        }
      }
    },
    ['query']
  )
)
