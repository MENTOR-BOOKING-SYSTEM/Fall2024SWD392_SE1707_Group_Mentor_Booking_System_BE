import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { GetProjectDetailReqParams, GetProjectReqParams, submitProjectBody } from '~/models/Request/Project.request'
import projectServices from '~/services/project.services'
import Project from '~/models/schemas/Project.schema'
import databaseService from '~/services/database.services'
import { DatabaseTable } from '~/constants/databaseTable'
import { ProjectStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { PROJECTS_MESSAGE, TECHNOLOGIES_MESSAGE } from '~/constants/messages'
import { Pagination } from '~/models/Request/Pagination.request'
import { TokenPayload } from '~/models/Request/User.request'
export const submitProjectController = async (
  req: Request<ParamsDictionary, any, submitProjectBody>,
  res: Response
) => {
  const { user_id, role } = req.decoded_authorization
  const isProjectExist = await databaseService.query<{ projectName: string; status: number }[]>(
    `select p.status,p.projectName,p.status from  ${DatabaseTable.Project} p join ${DatabaseTable.User_Own_Project} up on p.projectID = up.projectID join ${DatabaseTable.User} u on u.userID = up.userID where u.userID = ? `,
    [user_id]
  )

  if (isProjectExist.length >= 3 && isProjectExist.every((item) => item.status === ProjectStatus.Pending)) {
    throw new ErrorWithStatus<typeof isProjectExist>({
      status: HTTP_STATUS.BAD_REQUEST,
      message: PROJECTS_MESSAGE.CAN_NOT_SEND_MORE_PROJECT,
      data: isProjectExist
    })
  } else if (isProjectExist.some((item) => item.status === ProjectStatus.Accepted)) {
    throw new ErrorWithStatus({
      message: PROJECTS_MESSAGE.PROJECT_HAS_BEEN_APPROVED,
      status: HTTP_STATUS.BAD_REQUEST,
      data: isProjectExist
    })
  }
  const result = await projectServices.createProject(req.body, user_id, role as string[])

  return res.json({
    message: PROJECTS_MESSAGE.SUBMIT_PROJECT_SUCESSFULLY,
    result
  })
}
export const getProjectController = async (req: Request<GetProjectReqParams, any, any, Pagination>, res: Response) => {
  const { type } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await projectServices.getProject(type, Number(req.query.limit), Number(req.query.page), user_id)
  return res.json({
    message: PROJECTS_MESSAGE.GET_PROJECT_SUCCESSFULLY,
    result
  })
}
export const getProjectDetailController = async (req: Request<GetProjectDetailReqParams>, res: Response) => {
  const result = await projectServices.getProjectDetail(Number(req.params.projectID))
  return res.json({
    message: PROJECTS_MESSAGE.GET_PROJECT_DETAIL_SUCCESSFULLY,
    result
  })
}

export const getProjectTechnologiesController = async (req: Request<{ slug: string }>, res: Response) => {
  const technologies = await projectServices.getProjectTechnologiesWithChildren(req.params.slug)
  return res.json({
    message: TECHNOLOGIES_MESSAGE.GET_TECHNOLOGIES_BY_PROJECT_SUCCESSFULLY,
    result: technologies
  })
}

export const getProjectPostController = async (req: Request<GetProjectDetailReqParams>, res: Response) => {
  const project = await projectServices.getProjectBySlug(req.params.slug)
  const result = await projectServices.getProjectPost(Number(project.projectID))
  return res.json({
    message: PROJECTS_MESSAGE.GET_PROJECT_POST_SUCCESSFULLY,
    result
  })
}
export const getProjectOwnController = async (req: Request<GetProjectDetailReqParams>, res: Response) => {
  const project = await projectServices.getProjectBySlug(req.params.slug)
  const result = await projectServices.getProjectOwn(Number(project.projectID))
  return res.json({
    message: PROJECTS_MESSAGE.GET_PROJECT_OWN_SUCCESSFULLY,
    result
  })
}
export const getProjectReviewController = async (req: Request<GetProjectDetailReqParams>, res: Response) => {
  const project = await projectServices.getProjectBySlug(req.params.slug)
  const result = await projectServices.getProjectReview(Number(project.projectID))
  return res.json({
    message: PROJECTS_MESSAGE.GET_PROJECT_REVIEW_SUCCESSFULLY,
    result
  })
}
export const getProjectGuideController = async (req: Request<GetProjectDetailReqParams>, res: Response) => {
  const project = await projectServices.getProjectBySlug(req.params.slug)
  const result = await projectServices.getProjectGuide(Number(project.projectID))
  return res.json({
    message: PROJECTS_MESSAGE.GET_PROJECT_GUIDE_SUCCESSFULLY,
    result
  })
}
export const getProjectSprintController = async (req: Request<GetProjectDetailReqParams>, res: Response) => {
  const project = await projectServices.getProjectBySlug(req.params.slug)
  const result = await projectServices.getProjectSprint(Number(project.projectID))
  return res.json({
    message: PROJECTS_MESSAGE.GET_PROJECT_SPRINT_SUCCESSFULLY,
    result
  })
}

export const getProjectDetailWithAttachmentsController = async (
  req: Request<GetProjectDetailReqParams>,
  res: Response
) => {
  const project = await projectServices.getProjectDetailBySlug(req.params.slug)
  const attachments = await projectServices.getProjectAttachments(Number(project.projectID))

  return res.json({
    message: PROJECTS_MESSAGE.GET_PROJECT_DETAIL_SUCCESSFULLY,
    result: {
      project,
      attachments
    }
  })
}
