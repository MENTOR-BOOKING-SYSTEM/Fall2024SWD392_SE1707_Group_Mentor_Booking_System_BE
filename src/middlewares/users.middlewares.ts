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
import { TokenRole } from '~/constants/enums'

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
          errorMessage: 'Vai trò phải là một chuỗi JSON hợp lệ'
        },
        custom: {
          options: (value) => {
            try {
              const roles = JSON.parse(value);
              if (!Array.isArray(roles)) {
                throw new Error('Vai trò phải là một mảng');
              }
              const validRoles = Object.values(TokenRole);
              return roles.every((role: string | number) => 
                typeof role === 'string' ? validRoles.includes(role as TokenRole) : 
                (typeof role === 'number' && role > 0 && role <= validRoles.length)
              );
            } catch (error) {
              throw new Error('Vai trò không hợp lệ');
            }
          },
          errorMessage: 'Vai trò không hợp lệ'
        }
      }
    },
    ['query']
  )
)
