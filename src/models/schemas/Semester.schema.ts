export interface SemesterType {
  semesterID?: string | null
  semesterName: string
  createdAt?: Date
  updatedAt?: Date
}
export default class Semester {
  semesterID: string | null
  semesterName: string
  createdAt?: Date
  updatedAt?: Date
  constructor({ semesterID, semesterName, createdAt, updatedAt }: SemesterType) {
    ;(this.semesterID = semesterID || null),
      (this.semesterName = semesterName),
      (this.createdAt = createdAt || new Date())
    this.updatedAt = updatedAt || new Date()
  }
}
