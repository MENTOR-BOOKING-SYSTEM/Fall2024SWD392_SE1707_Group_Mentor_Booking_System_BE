import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { GROUPS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { CreateGroupParams, CreateGroupReqBody, RemoveGroupMemberReqBody } from '~/models/Request/Group.requests'
import groupServices from '~/services/group.services'

import userService from '~/services/user.services'

export const createGroupController = async (req: Request<ParamsDictionary, any, CreateGroupReqBody>, res: Response) => {
  const { groupName, usersID } = req.body
  const result = await groupServices.createGroup(groupName, usersID)

  return res.json({
    message: GROUPS_MESSAGES.CREATE_GROUP_SUCCESSFULLY,
    result
  })
}
export const getRequestPendingController = async (req: Request<CreateGroupParams>, res: Response) => {
  const groupID = Number(req.params.groupID)
  const result = await groupServices.getRequestPending(groupID)
  return res.json({
    message: GROUPS_MESSAGES.GET_REQUEST_PENDING_SUCCESSFULLY,
    result
  })
}
export const removeGroupMemberController = async (
  req: Request<ParamsDictionary, any, RemoveGroupMemberReqBody>,
  res: Response
) => {
  const { groupID, userID } = req.body
  const result = await groupServices.removeGroupMember(groupID, userID)
  return res.json({
    message: GROUPS_MESSAGES.REMOVE_GROUP_MEMBER_SUCCESSFULLY,
    result
  })
}
