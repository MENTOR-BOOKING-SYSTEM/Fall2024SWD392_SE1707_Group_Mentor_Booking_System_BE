import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { GROUPS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import {
  AddGroupMemberReqBody,
  AssignGroupLeaderReqBody,
  CreateGroupParams,
  CreateGroupReqBody,
  RemoveGroupMemberReqBody
} from '~/models/Request/Group.requests'
import { TokenPayload } from '~/models/Request/User.request'
import groupServices from '~/services/group.services'

import userService from '~/services/user.services'

export const createGroupController = async (req: Request<ParamsDictionary, any, CreateGroupReqBody>, res: Response) => {
  const { groupName, usersID } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await groupServices.createGroup(groupName, usersID, user_id)

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
export const addUserToGroup = async (req: Request<ParamsDictionary, any, AddGroupMemberReqBody>, res: Response) => {
  const { groupID, userID } = req.body
  const result = await groupServices.addMemberToGroup(groupID, userID)
  return res.json({
    message: GROUPS_MESSAGES.ADD_MEMBER_SUCCESSFULLY,
    result
  })
}
export const assignLeaderController = async (
  req: Request<ParamsDictionary, any, AssignGroupLeaderReqBody>,
  res: Response
) => {
  const { groupID, userID } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await groupServices.assignLeader(groupID, userID, Number(user_id))
  return res.json({
    message: GROUPS_MESSAGES.ASSIGN_NEW_LEADER_SUCCESSFULLY,
    result
  })
}
export const getListUserFromGroupController = async (
  req: Request<CreateGroupParams, any, AssignGroupLeaderReqBody>,
  res: Response
) => {
  const { groupID } = req.params
  const result = await groupServices.getListUserFromGroup(groupID)
  return res.json({
    message: GROUPS_MESSAGES.GET_LIST_USER_FROM_GROUP_SUCCESSFULLY,
    result
  })
}

export const getUserGroupController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await groupServices.getUserGroup(user_id)
  return res.json({
    message: result ? GROUPS_MESSAGES.GET_USER_GROUP_SUCCESSFULLY : GROUPS_MESSAGES.USER_HAS_NO_GROUP,
    result
  })
}
