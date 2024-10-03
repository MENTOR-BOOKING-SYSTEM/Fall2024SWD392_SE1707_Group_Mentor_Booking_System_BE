import User from '~/schemas/User.schema'
import databaseService from './database.services'
import { TokenRole, TokenType } from '~/constants/enums'
import { signToken, verifyToken } from '~/utils/jwt'
import { envConfig } from '~/constants/config';
import RefreshToken from '~/schemas/RefreshToken.schema';
import { v4 as uuidv4 } from 'uuid';
import { handlRandomId, sprearObjectToArray } from '~/utils/randomId';
class UserService {
  private signAccessToken({ user_id, role }: { user_id: string; role: TokenRole }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        role
      },
      privateKey: envConfig.jwtSecretAccessToken as string,
      options: {
        expiresIn: envConfig.accessTokenExpiresIn
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
        privateKey: envConfig.jwtSecretRefreshToken as string
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        role
      },
      privateKey: envConfig.jwtSecretRefreshToken as string,
      options: {
        expiresIn: envConfig.refreshTokenExpiresIn
      }
    })
  }
  private signAccessAndRefreshToken({ user_id, role }: { user_id: string; role: TokenRole }) {
    return Promise.all([this.signAccessToken({ user_id, role }), this.signRefreshToken({ user_id, role })])
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.jwtSecretRefreshToken as string
    })
  }
  async login({ user_id, role }: { user_id: string; role: TokenRole }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      role
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    const data = new RefreshToken({ _id: handlRandomId(), token: refresh_token, userID: user_id, iat, exp })

    await databaseService.query("insert into refresh_tokens(_id,token,created_at,userID,iat,exp) values (?,?,?,?,?,?)", sprearObjectToArray(data))
    return {
      access_token,
      refresh_token
    }
  }
}
const userService = new UserService()
export default userService
