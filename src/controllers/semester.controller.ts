import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SemesterType } from '~/models/schemas/Semester.schema'
import semesterService from '~/services/semester.services'
import { wrapReqHandler } from '~/utils/handler'

export const getAllSemestersController = wrapReqHandler(async (req: Request, res: Response) => {
  const result = await semesterService.getAllSemesters()
  res.json({
    message: 'Lấy danh sách học kỳ thành công',
    result
  })
})

export const getSemesterByIdController = wrapReqHandler(async (req: Request<ParamsDictionary, any, any, any>, res: Response) => {
  const { semesterID } = req.params
  const result = await semesterService.getSemesterById(semesterID)
  res.json({
    message: 'Lấy thông tin học kỳ thành công',
    result
  })
})