export interface GroupType {
  groupID?: string | null
  groupName: string
  semesterID: string
  projectID?: string | null
  createdAt?: Date
  updatedAt?: Date
}
export default class Group {
  groupID?: string | null
  groupName: string
  semesterID: string
  projectID: string | null
  createdAt?: Date
  updatedAt?: Date
  constructor({ groupID, groupName, semesterID, projectID, createdAt, updatedAt }: GroupType) {
    this.groupID = groupID || null
    this.groupName = groupName
    this.semesterID = semesterID
    this.projectID = projectID || null
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }
}
