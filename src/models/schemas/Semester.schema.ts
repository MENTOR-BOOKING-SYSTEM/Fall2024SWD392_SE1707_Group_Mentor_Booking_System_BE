export interface SemesterType {
  semesterID?: string | null
  semesterName: string
  startDate: Date
  endDate: Date
  description?: string | null
  createdAt?: Date
  updatedAt?: Date
}
export default class Semester {
  semesterID: string | null
  semesterName: string
  startDate: Date
  endDate: Date
  description?: string | null
  createdAt?: Date
  updatedAt?: Date
  constructor({ semesterID, semesterName, description, startDate, endDate, createdAt, updatedAt }: SemesterType) {
    ;(this.semesterID = semesterID || null),
      (this.startDate = startDate),
      (this.endDate = endDate),
      (this.semesterName = semesterName),
      (this.description = description || null),
      (this.createdAt = createdAt || new Date())
    this.updatedAt = updatedAt || new Date()
  }
}
