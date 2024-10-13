import oauthService from '~/services/oauth.services'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { OAuthCodeReqQuery } from '~/models/Request/OAuth.request'
import { envConfig } from '~/constants/config'

export const oauthController = async (req: Request<ParamsDictionary, any, any, OAuthCodeReqQuery>, res: Response) => {
  const { code } = req.query
  const response = await oauthService.oauthGoogle(code as string)
  const redirectUrl = `${envConfig.frontendUrl}/auth?accessToken=${response?.accessToken}&refreshToken=${response?.refreshToken}`

  return res.redirect(redirectUrl)
}
