import { handleRandomId } from '~/utils/randomId'

export interface RefreshTokenType {
  _id?: string | null
  token: string
  created_at?: Date
  userID: string
  iat: number
  exp: number
}
export default class RefreshToken {
  _id?: string | null
  token: string
  created_at: Date
  userID: string
  iat: Date
  exp: Date
  constructor({ _id, token, created_at, userID, iat, exp }: RefreshTokenType) {
    this._id = _id || null
    this.token = token
    this.created_at = created_at || new Date()
    this.userID = userID
    this.iat = new Date(iat * 1000)
    this.exp = new Date(exp * 1000)
  }
}
