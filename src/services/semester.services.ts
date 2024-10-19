import { SemesterType } from '~/models/schemas/Semester.schema'
import databaseService from './database.services'
import { DatabaseTable } from '~/constants/databaseTable'
import Semester from '~/models/schemas/Semester.schema'
import { addWeeks, endOfWeek, startOfWeek, subMilliseconds, subWeeks } from 'date-fns'
import { CreateSemesterReqBody } from '~/models/Request/Semester.request'
import { Timestamp } from '~/models/schemas/Timestamp.schema'

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

  async create(semester: Semester) {
    const { semesterName, startDate, endDate, description } = semester
    await databaseService.query<Semester[]>(
      `INSERT INTO ${DatabaseTable.Semester}(semesterName, startDate, endDate, description) VALUES (?, ?, ?, ?)`,
      [semesterName, startDate, endDate, description]
    )
  }

  private getStartEndDateNWeeksBefore(semester: Semester, nWeeks: number[]) {
    let nStartDate = semester.startDate
    let nEndDate = semester.endDate
    if (nWeeks.length === 2) {
      const startWeek = nWeeks[0]
      nStartDate = startOfWeek(subWeeks(semester.startDate, startWeek), { weekStartsOn: 1 })
      const endWeek = nWeeks[1]
      nEndDate = subMilliseconds(endOfWeek(subWeeks(semester.startDate, endWeek), { weekStartsOn: 1 }), 999)
    } else {
      const dateNWeeksBefore = subWeeks(semester.startDate, nWeeks[0])
      nStartDate = startOfWeek(dateNWeeksBefore, { weekStartsOn: 1 })
      nEndDate = subMilliseconds(endOfWeek(dateNWeeksBefore, { weekStartsOn: 1 }), 999)
    }

    return {
      startDate: nStartDate,
      endDate: nEndDate
    }
  }

  private getStartEndDateNWeeksAfter(semester: Semester, nWeeks: number[]) {
    let nStartDate = semester.startDate
    let nEndDate = semester.endDate
    if (nWeeks.length === 2) {
      const startWeek = nWeeks[0]
      nStartDate = startOfWeek(addWeeks(semester.endDate, startWeek), { weekStartsOn: 1 })
      const endWeek = nWeeks[1]
      nEndDate = subMilliseconds(endOfWeek(addWeeks(semester.endDate, endWeek), { weekStartsOn: 1 }), 999)
    } else {
      const dateNWeeksAfter = addWeeks(semester.startDate, nWeeks[0])
      nStartDate = startOfWeek(dateNWeeksAfter, { weekStartsOn: 1 })
      nEndDate = subMilliseconds(endOfWeek(dateNWeeksAfter, { weekStartsOn: 1 }), 999)
    }

    return {
      startDate: nStartDate,
      endDate: nEndDate
    }
  }

  async addTimestampsToDB(semester: Semester, timestampIDs: number[], nWeeks: number[], isBefore = true) {
    const { startDate: nStartDate, endDate: nEndDate } = isBefore
      ? this.getStartEndDateNWeeksBefore(semester, nWeeks)
      : this.getStartEndDateNWeeksAfter(semester, nWeeks)

    await Promise.all(
      timestampIDs.map(async (timestampID) => {
        await databaseService.query<Semester[]>(
          `INSERT INTO ${DatabaseTable.Semester_Timestamp}(semesterID, timestampID, startDate, endDate)
           VALUES (?, ?, ?, ?)`,
          [semester.semesterID, timestampID, nStartDate, nEndDate]
        )
      })
    )
  }

  async setUpTimestamp(semester: Semester) {
    return Promise.all([
      this.addTimestampsToDB(semester, [7], [6]),
      this.addTimestampsToDB(semester, [1], [5]),
      this.addTimestampsToDB(semester, [2, 3], [3]),
      this.addTimestampsToDB(semester, [4], [2]),
      this.addTimestampsToDB(semester, [5], [2, 1]),
      this.addTimestampsToDB(semester, [8], [2], false),
      this.addTimestampsToDB(semester, [9], [4], false),
      this.addTimestampsToDB(semester, [10], [6], false),
      this.addTimestampsToDB(semester, [11], [8], false),
      this.addTimestampsToDB(semester, [12], [10], false)
    ])
  }

  async createAndSetupTimestamp(semester: Semester) {
    await this.create(semester)
    const [createdSemester] = await databaseService.query<Semester[]>(
      `SELECT semesterID FROM ${DatabaseTable.Semester} WHERE semesterName = ?`,
      [semester.semesterName]
    )

    if (createdSemester && createdSemester.semesterID) {
      const updatedSemester = new Semester({ ...semester, semesterID: createdSemester.semesterID })
      await this.setUpTimestamp(updatedSemester)
    }
  }

  async assignCriteriaToSemester(semesterID: string, criteriaIDs: string[]) {
    const values = criteriaIDs.map((criteriaID) => [semesterID, criteriaID])
    await databaseService.query(
      `DELETE FROM ${DatabaseTable.Semester_Criteria} WHERE semesterID = ? AND criteriaID NOT IN (?)`,
      [semesterID, criteriaIDs]
    )
    await databaseService.query(
      `INSERT INTO ${DatabaseTable.Semester_Criteria} (semesterID, criteriaID) VALUES ? 
       ON DUPLICATE KEY UPDATE criteriaID = VALUES(criteriaID)`,
      [values]
    )
  }

  async editSemester(semesterID: string, updateData: Partial<CreateSemesterReqBody>) {
    const { semesterName, startDate, endDate, description } = updateData

    let updateFields = ''
    const updateValues = []

    if (semesterName !== undefined) {
      updateFields += 'semesterName = ?, '
      updateValues.push(semesterName)
    }
    if (startDate !== undefined) {
      updateFields += 'startDate = ?, '
      updateValues.push(startDate)
    }
    if (endDate !== undefined) {
      updateFields += 'endDate = ?, '
      updateValues.push(endDate)
    }
    if (description !== undefined) {
      updateFields += 'description = ?, '
      updateValues.push(description)
    }

    // Xóa dấu phẩy cuối cùng
    updateFields = updateFields.slice(0, -2)

    await databaseService.query(`UPDATE ${DatabaseTable.Semester} SET ${updateFields} WHERE semesterID = ?`, [
      ...updateValues,
      semesterID
    ])

    const [updatedSemester] = await databaseService.query<SemesterType[]>(
      `SELECT * FROM ${DatabaseTable.Semester} WHERE semesterID = ?`,
      [semesterID]
    )

    return updatedSemester
  }

  async getSemesterTimestamp(semesterID: string) {
    const timestamps = await databaseService.query<Timestamp[]>(
      `
      SELECT st.timestampID, t.timestampName, st.startDate, st.endDate, t.phase
      FROM ${DatabaseTable.Semester_Timestamp} AS st
      JOIN ${DatabaseTable.Timestamp} AS t ON st.timestampID = t.timestampID
      WHERE st.semesterID = ?
      `,
      [semesterID]
    )
    if (!timestamps.length) return []

    return timestamps.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }
}

const semesterService = new SemesterService()
export default semesterService
