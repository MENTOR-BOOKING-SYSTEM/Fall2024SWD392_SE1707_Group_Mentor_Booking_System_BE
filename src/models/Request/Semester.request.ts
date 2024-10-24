export interface CreateSemesterReqBody {
  semesterName: string
  startDate: Date
  endDate: Date
  description?: string | null
}

export interface AssignCriteriaReqBody {
  semesterID: string
  criteria: string[]
}

export interface GetSemesterTimestampParams {
  semesterID?: string
}
