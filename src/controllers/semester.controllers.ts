import Semester from '~/models/schemas/Semester.schema'
import semesterService from '~/services/semester.services'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CreateSemesterReqBody } from '~/models/Request/Semester.request'
import { SEMESTERS_MESSAGES } from '~/constants/messages'

export const createSemesterController = async (
  req: Request<ParamsDictionary, any, CreateSemesterReqBody>,
  res: Response
) => {
  const semester = req.body as Semester
  await semesterService.createAndSetupTimestamp(semester)
  res.send({
    message: SEMESTERS_MESSAGES.SEMESTER_CREATED_SUCCESSFULLY
  })
}
