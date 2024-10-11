import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { TokenRole, TokenType } from '~/constants/enums'
import { signToken, verifyToken } from '~/utils/jwt'
import { envConfig } from '~/constants/config'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { handleSpreadObjectToArray } from '~/utils/spreadObjectToArray'
import { GetUserListQuery } from '~/models/Request/User.request'
import { DatabaseTable } from '~/constants/databaseTable'
import { hashPassword } from '~/utils/crypto'
import { TokenPayload } from '~/models/Request/User.request'
import { AuthError } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'

class UserService {
  private signAccessToken({ user_id, role }: { user_id: string; role: string[] }) {
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
  private signRefreshToken({ user_id, role, exp }: { user_id: string; role: string[]; exp?: number }) {
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

  private signForgotPasswordToken(email: string) {
    return signToken({
      payload: {
        email,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: envConfig.jwtSecretForgotPasswordToken as string,
      options: {
        expiresIn: envConfig.forgotPasswordTokenExpiresIn
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, role }: { user_id: string; role: string[] }) {
    return Promise.all([this.signAccessToken({ user_id, role }), this.signRefreshToken({ user_id, role })])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.jwtSecretRefreshToken as string
    })
  }

  async login({ user_id }: { user_id: string }) {
    const roleUser = await databaseService.query<{ roleName: string }[]>(
      `SELECT r.roleName FROM User u JOIN User_Role ur ON u.userID = ur.userID JOIN Role r ON ur.roleID = r.roleID where u.userID = ? `,
      [user_id]
    )
    const role = (roleUser as { roleName: string }[]).map((item) => item.roleName)
    console.log(roleUser)

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
    const queryString =
      nonGroup === 'true'
        ? `select * from ${DatabaseTable.User} where userID not in (select userID from ${DatabaseTable.User_Group} )`
        : 'select * from User'

    const result = await databaseService.query<User[]>(queryString)
    return result
  }

  async forgotPassword(email: string) {
    const forgotPasswordToken = await this.signForgotPasswordToken(email)
    await databaseService.query('UPDATE User SET forgotPasswordToken = ? WHERE email = ?', [forgotPasswordToken, email])
    return forgotPasswordToken
  }

  async resetPassword(password: string, email: string) {
    await databaseService.query('UPDATE User SET password = ?, forgotPasswordToken = ? WHERE email = ?', [
      hashPassword(password),
      null,
      email
    ])
  }

  async refreshToken(refresh_token: string) {
    const decoded_refresh_token = await this.decodeRefreshToken(refresh_token)
    const { user_id, exp, iat } = decoded_refresh_token

    const [refresh_token_db] = await databaseService.query<RefreshToken[]>(
      'SELECT * FROM Refresh_Tokens WHERE token = ?',
      [refresh_token]
    )

    if (!refresh_token_db) {
      throw new AuthError({ message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID })
    }

    if (Date.now() >= exp * 1000) {
      await databaseService.query('DELETE FROM Refresh_Tokens WHERE token = ?', [refresh_token])
      throw new AuthError({ message: USERS_MESSAGES.REFRESH_TOKEN_IS_EXPIRED })
    }

    const roleUser = await databaseService.query<{ roleName: string }[]>(
      `SELECT r.roleName FROM User u JOIN User_Role ur ON u.userID = ur.userID JOIN Role r ON ur.roleID = r.roleID where u.userID = ? `,
      [user_id]
    )
    const role = roleUser.map((item) => item.roleName)

    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, role }),
      this.signRefreshToken({ user_id, role, exp })
    ])

    await databaseService.query('UPDATE Refresh_Tokens SET token = ? WHERE token = ?', [new_refresh_token, refresh_token])

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }
}

const userService = new UserService()
export default userService
