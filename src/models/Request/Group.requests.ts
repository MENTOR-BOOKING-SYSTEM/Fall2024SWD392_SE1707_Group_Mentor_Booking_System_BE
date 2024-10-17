import { ParamsDictionary } from 'express-serve-static-core'
export interface CreateGroupReqBody {
  groupName: string
  usersID: number[]
}
export interface CreateGroupParams extends ParamsDictionary {
  groupID: string
}
export interface RemoveGroupMemberReqBody {
  groupID: number
  userID: number
}
