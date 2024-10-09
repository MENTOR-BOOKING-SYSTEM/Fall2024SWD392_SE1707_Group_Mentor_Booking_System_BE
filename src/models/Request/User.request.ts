import { TokenRole, TokenType } from '~/constants/enums'
import { JwtPayload } from 'jsonwebtoken'
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  email: string
  role: TokenRole
  exp: number
  iat: number
}
export interface LoginReqBody {
  email: string
  password: string
}
export interface GetUserListQuery {
  nonGroup?: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordTokenReqQuery {
  code?: string
}
