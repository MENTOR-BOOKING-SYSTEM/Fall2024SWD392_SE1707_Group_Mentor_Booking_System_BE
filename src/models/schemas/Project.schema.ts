import { ProjectStatus } from '~/constants/enums'
import { handleRandomId } from '~/utils/randomId'

export interface ProjectType {
  projectID?: string
  projectName: string
  slug?: string
  funcRequirements: string
  nonFuncRequirements?: string
  context?: string
  actors: string
  problems?: string
  status?: ProjectStatus
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}
export default class Project {
  projectID: string
  projectName: string
  slug: string
  funcRequirements: string
  nonFuncRequirements: string
  context: string
  actors: string
  problems: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  constructor({
    projectID,
    projectName,
    slug,
    funcRequirements,
    nonFuncRequirements,
    context,
    actors,
    problems,
    status,
    createdAt,
    updatedAt,
    deletedAt
  }: ProjectType) {
    ; (this.projectID = projectID || handleRandomId()),
      (this.projectName = projectName),
      (this.slug = slug || this.projectName.toLowerCase().replace(/ /g, '-')),
      (this.funcRequirements = funcRequirements),
      (this.nonFuncRequirements = nonFuncRequirements || ''),
      (this.context = context || ''),
      (this.actors = actors),
      (this.problems = problems || ''),
      (this.status = status || ProjectStatus.Pending),
      (this.createdAt = createdAt || new Date()),
      (this.updatedAt = updatedAt || new Date()),
      (this.deletedAt = deletedAt || new Date())
  }
}
