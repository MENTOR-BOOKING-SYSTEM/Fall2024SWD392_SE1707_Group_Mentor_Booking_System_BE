import axios from 'axios'
import databaseService from './database.services'
import User from '~/models/schemas/User.schema'
import userService from './user.services'
import { envConfig } from '~/constants/config'
import { BadRequestError } from '~/models/Errors'
import { GoogleTokens, GoogleUserInfo } from '~/models/Response/OAuth.response'

class OAuthService {
  private async getGoogleToken(code: string) {
    try {
      const { data } = await axios.post<GoogleTokens>(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: envConfig.gcpClientId,
          client_secret: envConfig.gcpClientSecret,
          redirect_uri: envConfig.gcpRedirectUri,
          grant_type: 'authorization_code'
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      return data
    } catch (error) {
      throw new Error('Google OAuth tokens failed')
    }
  }

  private async getGoogleUser(accessToken: string, idToken: string) {
    try {
      const { data } = await axios.get<GoogleUserInfo>('https://www.googleapis.com/oauth2/v1/userinfo', {
        params: {
          access_token: accessToken,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      })
      return data
    } catch (error) {
      throw new Error('Google OAuth user info failed')
    }
  }

  async oauthGoogle(code: string, semesterID: number) {
    const { access_token, id_token } = await this.getGoogleToken(code)
    const userInfo = await this.getGoogleUser(access_token, id_token)

    if (!userInfo.verified_email) {
      throw new BadRequestError({ message: 'Google OAuth email not verified' })
    }
    const [user] = await databaseService.query<User[]>(`SELECT userID FROM User WHERE email = ?`, [userInfo.email])
    if (user) {
      return await userService.login({ user_id: user.userID, semesterID })
    }
    // else {
    //   const newUser = new User({
    //     userID: '',
    //     email: userInfo.email,
    //     username: userInfo.email.split('@')[0],
    //     avatarUrl: userInfo.picture,
    //     firstName: userInfo.given_name,
    //     lastName: userInfo.family_name,
    //     password: ''
    //   })
    //   await databaseService.query('INSERT INTO User SET ?', [newUser])
    //   const [user] = await databaseService.query<User[]>(`SELECT userID FROM User WHERE email = ?`, [userInfo.email])
    //   return await userService.login({ user_id: user.userID })
    // }
  }
}

const oauthService = new OAuthService()
export default oauthService
