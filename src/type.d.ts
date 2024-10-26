import Semester from './models/schemas/Semester.schema'
import { Request } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'

declare module 'express' {
  interface Request {
    user?: User
    currentSemester?: Semester
    currentPhase?: string[]
    projectID?: number
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}
