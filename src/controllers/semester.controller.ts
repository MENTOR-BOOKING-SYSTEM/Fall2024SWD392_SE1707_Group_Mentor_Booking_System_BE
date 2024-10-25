import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SemesterType } from '~/models/schemas/Semester.schema'
import semesterService from '~/services/semester.services'
import { wrapReqHandler } from '~/utils/handler'
import Semester from '~/models/schemas/Semester.schema'
import { CreateSemesterReqBody, GetSemesterTimestampParams } from '~/models/Request/Semester.request'
import { SEMESTERS_MESSAGES } from '~/constants/messages'
import { AssignCriteriaReqBody } from '~/models/Request/Semester.request'

export const getAllSemestersController = wrapReqHandler(async (req: Request, res: Response) => {
  const result = await semesterService.getAllSemesters()
  res.json({
    message: 'Get the list of successful semesters',
    result
  })
})

export const getCurrentSemesterController = async (req: Request, res: Response) => {
  const currentSemester = req.currentSemester
  res.send({
    message: SEMESTERS_MESSAGES.GET_CURRENT_SEMESTER_SUCCESSFULLY,
    result: currentSemester
  })
}

export const getSemesterByIdController = wrapReqHandler(
  async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
    const { semesterID } = req.params
    const result = await semesterService.getSemesterById(semesterID)
    res.json({
      message: 'Get semester information successfully',
      result
    })
  }
)

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

export const getCurrentPhaseController = async (req: Request, res: Response) => {
  const currentPhase = req.currentPhase
  res.send({
    message: SEMESTERS_MESSAGES.GET_CURRENT_PHASE_SUCCESSFULLY,
    result: currentPhase
  })
}

export const assignCriteriaToSemesterController = async (
  req: Request<ParamsDictionary, any, AssignCriteriaReqBody>,
  res: Response
) => {
  const { semesterID, criteria } = req.body
  await semesterService.assignCriteriaToSemester(semesterID, criteria)
  res.send({
    message: SEMESTERS_MESSAGES.ASSIGN_CRITERIA_SUCCESSFULLY
  })
}

export const editSemesterController = async (
  req: Request<ParamsDictionary, any, Partial<CreateSemesterReqBody>>,
  res: Response
) => {
  const { semesterID } = req.params
  const updateData = req.body

  const updatedSemester = await semesterService.editSemester(semesterID, updateData)

  res.json({
    message: SEMESTERS_MESSAGES.SEMESTER_UPDATED_SUCCESSFULLY,
    result: updatedSemester
  })
}

export const getSemesterTimestampController = async (req: Request<GetSemesterTimestampParams>, res: Response) => {
  const { semesterID } = req.params
  const result = await semesterService.getSemesterTimestamp(semesterID as string)

  res.json({
    message: SEMESTERS_MESSAGES.GET_SEMESTER_TIMESTAMP_SUCCESSFULLY,
    result
  })
}
