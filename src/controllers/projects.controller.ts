import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { submitProjectBody } from '~/models/Request/Project.request'
import projectServices from '~/services/project.services'
import Project from '~/models/schemas/Project.schema'
import databaseService from '~/services/database.services'
import { DatabaseTable } from '~/constants/databaseTable'
import { ProjectStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { PROJECTS_MESSAGE } from '~/constants/messages'
export const submitProjectController = async (
  req: Request<ParamsDictionary, any, submitProjectBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization
  const [isProjectExist] = await databaseService.query<{ projectName: string; status: number }[]>(
    `select p.status,p.projectName,p.status from  ${DatabaseTable.Project} p join ${DatabaseTable.User_Own_Project} up on p.projectID = up.projectID join ${DatabaseTable.User} u on u.userID = up.userID where u.userID = ? `,
    [user_id]
  )
  if (isProjectExist && isProjectExist.status === ProjectStatus.Pending) {
    throw new ErrorWithStatus<typeof isProjectExist>({
      status: HTTP_STATUS.BAD_REQUEST,
      message: PROJECTS_MESSAGE.CAN_NOT_SEND_MORE_PROJECT,
      data: isProjectExist
    })
  }
  const result = await projectServices.createProject(req.body, user_id, role as string[])

  return res.json({
    message: PROJECTS_MESSAGE.SUBMIT_PROJECT_SUCESSFULLY,
    result
  })
}