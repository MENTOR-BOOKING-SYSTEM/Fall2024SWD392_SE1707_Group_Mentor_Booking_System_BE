import { Request, Response } from 'express'
import criteriaService from '~/services/criteria.services'
import { CRITERIA_MESSAGES } from '~/constants/messages'
import { ConflictError, NotFoundError, BadRequestError, ForbiddenError } from '~/models/Errors'
import { TokenRole } from '~/constants/enums'

export const createCriteriaController = async (req: Request, res: Response) => {
  const { role } = req.decoded_authorization as { role: TokenRole }

  // Kiểm tra quyền: chỉ Admin mới có thể tạo tiêu chí
  if (role !== TokenRole.Admin) {
    throw new ForbiddenError({ message: 'You do not have permission to create criteria' })
  }

  const { name, type, description } = req.body

  const existingCriteria = await criteriaService.getCriteriaByName(name)
  if (existingCriteria) {
    throw new ConflictError({ message: CRITERIA_MESSAGES.CRITERIA_NAME_ALREADY_EXISTS })
  }

  const criteria = await criteriaService.createCriteria(name, type, description)

  return res.status(201).json({
    message: CRITERIA_MESSAGES.CREATE_CRITERIA_SUCCESSFULLY,
    result: criteria
  })
}

export const getAllCriteriaController = async (req: Request, res: Response) => {
  const criteria = await criteriaService.getAllCriteria()

  return res.status(200).json({
    message: CRITERIA_MESSAGES.GET_ALL_CRITERIA_SUCCESSFULLY,
    result: criteria
  })
}

export const getCriteriaByIdController = async (req: Request, res: Response) => {
  const { criteriaID } = req.params
  const criteria = await criteriaService.getCriteriaById(criteriaID)

  if (!criteria) {
    throw new NotFoundError({ message: CRITERIA_MESSAGES.CRITERIA_NOT_FOUND })
  }

  return res.status(200).json({
    message: CRITERIA_MESSAGES.GET_CRITERIA_SUCCESSFULLY,
    result: criteria
  })
}

export const getCriteriaBySemesterIdController = async (req: Request, res: Response) => {
  const { semesterID } = req.params

  if (!semesterID) {
    throw new BadRequestError({ message: CRITERIA_MESSAGES.SEMESTER_ID_IS_REQUIRED })
  }

  const criteria = await criteriaService.getCriteriaBySemesterId(semesterID)

  return res.status(200).json({
    message: CRITERIA_MESSAGES.GET_CRITERIA_BY_SEMESTER_SUCCESSFULLY,
    result: criteria
  })
}
