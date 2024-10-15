import { Request, Response, NextFunction } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

const semesterIdSchema: ParamSchema = {
  notEmpty: {
    errorMessage: 'Mã học kỳ không được để trống'
  },
  isString: {
    errorMessage: 'Mã học kỳ phải là chuỗi'
  },
  trim: true
}

export const semesterIdValidator = validate(
  checkSchema(
    {
      semesterID: semesterIdSchema
    },
    ['params']
  )
)

