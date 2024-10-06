import { TokenRole, TokenType } from '~/constants/enums'
import { JwtPayload } from 'jsonwebtoken'
export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  role: TokenRole
  exp: number
  iat: number
}
export interface LoginReqBody {
  email: string
  password: string
}
