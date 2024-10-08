import { Request } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'

type TokenType = 'access_token' | 'refresh_token' | 'forgot_password_token'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const verifyTokenByType = async (token: string, tokenType: TokenType, req?: Request) => {
  if (!token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  let secretOrPublicKey: string

  switch (tokenType) {
    case 'access_token':
      secretOrPublicKey = envConfig.jwtSecretAccessToken
      break
    case 'refresh_token':
      secretOrPublicKey = envConfig.jwtSecretRefreshToken
      break
    case 'forgot_password_token':
      secretOrPublicKey = envConfig.jwtSecretForgotPasswordToken
      break
    default:
      throw new ErrorWithStatus({
        message: 'Invalid token type',
        status: HTTP_STATUS.UNAUTHORIZED
      })
  }

  try {
    const decoded_token = await verifyToken({
      token,
      secretOrPublicKey
    })

    if (req) {
      switch (tokenType) {
        case 'access_token':
          req.decoded_authorization = decoded_token
          break
        case 'refresh_token':
          req.decoded_refresh_token = decoded_token
          break
        case 'forgot_password_token':
          req.decoded_forgot_password_token = decoded_token
          break
      }
    }

    return decoded_token
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}
