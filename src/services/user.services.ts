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
import { NotFoundError } from '~/models/Errors'
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

  private signAccessAndRefreshToken({ user_id, role, exp }: { user_id: string; role: string[]; exp?: number }) {
    return Promise.all([this.signAccessToken({ user_id, role }), this.signRefreshToken({ user_id, role, exp })])
  }
  async refreshToken({
    user_id,
    refreshToken,
    role,
    exp
  }: {
    user_id: string
    refreshToken: string
    role: string[]
    exp: number
  }) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, role, exp }),
      databaseService.query(`DELETE FROM ${DatabaseTable.Refresh_Token} WHERE token = ?;`, [refreshToken])
    ])
    const [access_token, new_refresh_token] = token
    const { iat } = await this.decodeRefreshToken(new_refresh_token)
    await databaseService.query(
      `Insert into ${DatabaseTable.Refresh_Token}(_id,token,created_at,userID,iat,exp) values(?,?,?,?,?,?)`,
      handleSpreadObjectToArray(new RefreshToken({ token: new_refresh_token, userID: user_id, exp, iat }))
    )
    return {
      access_token,
      refresh_token: new_refresh_token
    }
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

  async updateProfile(user_id: string, payload: { firstName?: string; lastName?: string; avatarUrl?: string }) {
    const updateFields = Object.entries(payload)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ?`)
      .join(', ')

    const updateValues = Object.values(payload).filter((value) => value !== undefined)

    if (updateFields.length > 0) {
      const query = `UPDATE ${DatabaseTable.User} SET ${updateFields} WHERE userID = ?`
      await databaseService.query(query, [...updateValues, user_id])
    }

    const [updatedUser] = await databaseService.query<User[]>(
      `SELECT firstName, lastName, avatarUrl FROM ${DatabaseTable.User} WHERE userID = ?`,
      [user_id]
    )

    return updatedUser
  }

  async getMe(user_id: string) {
    const [user] = await databaseService.query<User[]>(
      `SELECT userID, email, username, firstName, lastName, avatarUrl 
       FROM ${DatabaseTable.User} 
       WHERE userID = ?`,
      [user_id]
    )

    if (!user) {
      throw new NotFoundError({ message: USERS_MESSAGES.USER_NOT_FOUND })
    }

    return user
  }

  async getProfile(user_id: string) {
    const [user] = await databaseService.query<User[]>(
      `SELECT userID, email, username, firstName, lastName, avatarUrl 
       FROM ${DatabaseTable.User} 
       WHERE userID = ?`,
      [user_id]
    )

    if (!user) {
      throw new NotFoundError({ message: USERS_MESSAGES.USER_NOT_FOUND })
    }

    return user
  }

  async getStudentsInSameGroup(user_id: string) {
    const query = `
      SELECT u.userID, u.avatarUrl, u.email
      FROM User u
      JOIN User_Group ug1 ON u.userID = ug1.userID
      JOIN User_Group ug2 ON ug1.groupID = ug2.groupID
      WHERE ug2.userID = ? AND u.userID != ?
    `
    const students = await databaseService.query<{ userID: string; avatarUrl: string; email: string }[]>(query, [
      user_id,
      user_id
    ])
    return students
  }

  async getInfo(user_id: string) {
    const [info] = await databaseService.query<User[]>(
      `
      SELECT u.email, u.firstName, u.lastName, u.avatarUrl, g.groupID, g.projectID, ug.position
      FROM ${DatabaseTable.User} AS u
      LEFT JOIN ${DatabaseTable.User_Group} AS ug ON u.userID = ug.userID 
      LEFT JOIN \`${DatabaseTable.Group}\` AS \`g\` ON ug.groupID = \`g\`.groupID
      WHERE u.userID = ?
      `,
      [user_id]
    )
    return info
  }

  async joinGroup({ userID, groupID }: { userID: number, groupID: number }) {
    const result = await databaseService.query(`Insert into ${DatabaseTable.User_Group}(userID,groupID,position) values (?,?,?)`, [userID, groupID, "Proposal"])
    return result
  }
}

const userService = new UserService()
export default userService
