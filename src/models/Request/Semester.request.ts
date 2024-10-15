export interface CreateSemesterReqBody {
  semesterName: string
  startDate: Date
  endDate: Date
  description?: string | null
}
