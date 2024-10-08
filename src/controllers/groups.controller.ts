import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { GROUPS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { CreateGroupReqBody } from '~/models/Request/Group.requests'
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
