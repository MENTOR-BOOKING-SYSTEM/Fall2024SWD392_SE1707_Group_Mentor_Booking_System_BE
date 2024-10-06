import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { TokenRole, TokenType } from '~/constants/enums'
import { signToken, verifyToken } from '~/utils/jwt'
import { envConfig } from '~/constants/config'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { GetUserListQuery } from '~/models/Request/User.request'
import { DatabaseTable } from '~/constants/databaseTable'

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
    const { _id, ...newToken } = new RefreshToken({ token: refresh_token, iat, exp, userID: user_id })
    await databaseService.query(
      'insert into Refresh_Tokens( token,created_at, userID,iat,exp) values (?,?,?,?,?)',
      handleSpreadObjectToArray(newToken)
    )
    return {
      accessToken: access_token,
      refreshToken: refresh_token
    }
  }
  async getListUser({ nonGroup }: GetUserListQuery) {

    // edit dynamic logic find user here
    const queryString = nonGroup === "true"
      ? `select * from ${DatabaseTable.User} where userID not in (select userID from ${DatabaseTable.User_Group} )`
      : 'select * from User'

    const result = await databaseService.query<User[]>(queryString)
    return result
  }
}
const userService = new UserService()
export default userService
