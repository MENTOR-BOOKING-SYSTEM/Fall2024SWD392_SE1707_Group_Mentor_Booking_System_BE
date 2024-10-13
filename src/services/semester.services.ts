import { SemesterType } from '~/models/schemas/Semester.schema'
import databaseService from './database.services'
import { DatabaseTable } from '~/constants/databaseTable'

class SemesterService {
  async getAllSemesters() {
    const semesters = await databaseService.query<SemesterType[]>(`SELECT * FROM ${DatabaseTable.Semester}`)
    return semesters
  }

  async getSemesterById(semesterID: string) {
    const [semester] = await databaseService.query<SemesterType[]>(
      `SELECT * FROM ${DatabaseTable.Semester} WHERE semesterID = ?`,
      [semesterID]
    )
    return semester
  }
}

const semesterService = new SemesterService()
export default semesterService