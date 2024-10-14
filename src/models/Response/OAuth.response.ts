export interface GoogleTokens {
  access_token: string
  id_token: string
}

export interface GoogleUserInfo {
  id: string
  email: string
  family_name: string
  given_name: string
  link: string
  locale: string
  name: string
  picture: string
  verified_email: boolean
}
