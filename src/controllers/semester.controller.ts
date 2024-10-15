import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SemesterType } from '~/models/schemas/Semester.schema'
import semesterService from '~/services/semester.services'
import { wrapReqHandler } from '~/utils/handler'
import Semester from '~/models/schemas/Semester.schema'
import { CreateSemesterReqBody } from '~/models/Request/Semester.request'
import { SEMESTERS_MESSAGES } from '~/constants/messages'

export const getAllSemestersController = wrapReqHandler(async (req: Request, res: Response) => {
  const result = await semesterService.getAllSemesters()
  res.json({
    message: 'Get the list of successful semesters',
    result
  })
})

export const getSemesterByIdController = wrapReqHandler(async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { semesterID } = req.params
  const result = await semesterService.getSemesterById(semesterID)
  res.json({
    message: 'Get semester information successfully',
    result
  })
})

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
