import { ParamsDictionary } from 'express-serve-static-core'
export interface submitProjectBody {
  projectName: string
  funcRequirements: string
  nonFuncRequirements?: string
  slug: string
  context?: string
  actors: string
  problems?: string
  technologies?: string[]
  collaborators?: string[]
  mentorID: string[]
  type: string
  groupID?: number
}
export interface GetProjectReqParams extends ParamsDictionary {
  type: string
}
export interface GetProjectDetailReqParams extends ParamsDictionary {
  projectID: string
}
