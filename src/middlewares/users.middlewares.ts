import { checkSchema, ParamSchema } from 'express-validator'
import { USERS_MESSAGES } from '~/constants/messages'
import User from '~/schemas/User.schema'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validation'
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
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const [user] = await databaseService.query<User & { role: string }[]>(
              'SELECT * FROM user u JOIN user_role ur ON u.userID = ur.userID JOIN role r ON ur.roleID = r.roleID WHERE u.email = ? AND u.password = ?',
              [value, req.body.password]
            )

            if (user === null) {
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
