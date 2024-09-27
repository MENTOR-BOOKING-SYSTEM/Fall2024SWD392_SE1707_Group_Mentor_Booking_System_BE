import User from '~/schemas/User.schema'
import databaseService from './database.services'
import { TokenRole, TokenType } from '~/constants/enums'
import { signToken, verifyToken } from '~/utils/jwt'

class UserService {
  private signAccessToken({ user_id, role }: { user_id: string; role: TokenRole }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        role
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  private signRefreshToken({ user_id, role, exp }: { user_id: string; role: TokenRole; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          role,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        role
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  private signAccessAndRefreshToken({ user_id, role }: { user_id: string; role: TokenRole }) {
    return Promise.all([this.signAccessToken({ user_id, role }), this.signRefreshToken({ user_id, role })])
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }
  async login({ user_id, role }: { user_id: string; role: TokenRole }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      role
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)
    return {
      access_token,
      refresh_token
    }
  }
}
const userService = new UserService()
export default userService