import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ERROR_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { NotFoundError } from '~/models/Errors'
import { confirmPasswordSchema, forgotPasswordSchema, passwordSchema } from '~/models/Form'
import { verifyTokenByType } from '~/utils/commons'
import { validate } from '~/utils/validation'
import { hashPassword } from '~/utils/crypto'
import { envConfig } from '~/constants/config'

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
              [value, value, hashPassword(req.body.password)]
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
      code: forgotPasswordSchema
    },
    ['query']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgotPasswordToken: forgotPasswordSchema,
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema
    },
    ['body']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_refresh_token = await verifyTokenByType(value, 'refresh_token', req as Request)
              req.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              throw new Error(USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
