import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ERROR_MESSAGES, GROUPS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus, ForbiddenError, NotFoundError } from '~/models/Errors'
import { confirmPasswordSchema, forgotPasswordSchema, passwordSchema } from '~/models/Form'
import { verifyTokenByType } from '~/utils/commons'
import { validate } from '~/utils/validation'
import { hashPassword } from '~/utils/crypto'
import { TokenRole } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { verifyToken } from '~/utils/jwt'
import { DatabaseTable } from '~/constants/databaseTable'
import { envConfig } from '~/constants/config'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { TokenPayload } from '~/models/Request/User.request'

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
export const refreshTokenValidator = validate(
  checkSchema(
    {
      refreshToken: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: envConfig.jwtSecretRefreshToken as string }),
                databaseService.query<{ token: string }>(
                  `Select token from ${DatabaseTable.Refresh_Token} where token = ?`,
                  [value]
                )
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
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

export const editProfileValidator = validate(
  checkSchema(
    {
      firstName: {
        optional: true,
        isString: {
          errorMessage: 'Tên phải là chuỗi'
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 50 },
          errorMessage: 'Tên phải có độ dài từ 1 đến 50 ký tự'
        }
      },
      lastName: {
        optional: true,
        isString: {
          errorMessage: 'Họ phải là chuỗi'
        },
        trim: true,
        isLength: {
          options: { min: 1, max: 50 },
          errorMessage: 'Họ phải có độ dài từ 1 đến 50 ký tự'
        }
      },
      avatarUrl: {
        optional: true,
        isURL: {
          errorMessage: 'URL ảnh đại diện không hợp lệ'
        }
      }
    },
    ['body']
  )
)

export const getUsersByRolesValidator = validate(
  checkSchema(
    {
      role: {
        in: ['query'],
        isString: {
          errorMessage: 'Role must be a valid JSON string'
        },
        custom: {
          options: (value) => {
            try {
              const roles = JSON.parse(value);
              if (!Array.isArray(roles) || roles.length === 0) {
                throw new Error('Role must be an array');
              }
              return roles.every((role) => typeof role === 'number' && role > 0);
            } catch (error) {
              throw new Error('Invalid role')
            }
          },
          errorMessage: 'Invalid role'
        }
      }
    },
    ['query']
  )
)

export const joinGroupValidator = validate(
  checkSchema({
    groupId: {
      notEmpty: true,
      isNumeric: true,
      custom: {
        options: async (value, { req }) => {
          const isExist = await databaseService.query<{ groupID: string }[]>(
            `select groupID from  \`${DatabaseTable.Group}\`  where groupID = ?`,
            [value]
          )
          if (!(isExist.length < 0)) {
            throw new ErrorWithStatus({
              message: GROUPS_MESSAGES.GROUP_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          return true
        }
      }
    }
  })
)

export const allowRoles = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.decoded_authorization as TokenPayload

      if (!role.some((role) => allowedRoles.includes(role))) {
        throw new ForbiddenError({ message: ERROR_MESSAGES.FORBIDDEN })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
