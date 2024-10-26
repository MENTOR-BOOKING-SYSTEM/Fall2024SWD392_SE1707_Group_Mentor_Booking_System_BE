export interface Sprint {
  sprintID: number
  projectID: number
  sprintName: string
  startDate: Date
  endDate: Date
  status: string
  createdAt: Date
  updatedAt: Date
}

export class SprintEntity implements Sprint {
  sprintID: number
  projectID: number
  sprintName: string
  startDate: Date
  endDate: Date
  status: string
  createdAt: Date
  updatedAt: Date

  constructor(sprint: Sprint) {
    this.sprintID = sprint.sprintID
    this.projectID = sprint.projectID
    this.sprintName = sprint.sprintName
    this.startDate = sprint.startDate
    this.endDate = sprint.endDate
    this.status = sprint.status
    this.createdAt = sprint.createdAt
    this.updatedAt = sprint.updatedAt
  }
}
