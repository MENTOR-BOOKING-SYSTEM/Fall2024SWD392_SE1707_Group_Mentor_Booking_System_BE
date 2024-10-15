import Semester from '~/models/schemas/Semester.schema'
import databaseService from '~/services/database.services'
import { checkSchema } from 'express-validator'
import { SEMESTERS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'
import { ConflictError, NotFoundError } from '~/models/Errors'
import { differenceInWeeks, parseISO } from 'date-fns'
import { NextFunction, Request, Response } from 'express'
import { DatabaseTable } from '~/constants/databaseTable'

export const getCurrentSemester = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentTime = new Date()
    const [semester] = await databaseService.query<Semester[]>(
      'SELECT semesterID, startDate, endDate FROM Semester WHERE startDate <= ? AND endDate >= ?',
      [currentTime, currentTime]
    )

    if (!semester) {
      throw new NotFoundError({ message: SEMESTERS_MESSAGES.SEMESTER_NOT_FOUND })
    }

    req.currentSemester = semester
    next()
  } catch (error) {
    next(error)
  }
}

export const createSemesterValidator = validate(
  checkSchema(
    {
      semesterName: {
        isString: {
          errorMessage: SEMESTERS_MESSAGES.SEMESTER_NAME_TYPE_INVALID
        },
        custom: {
          options: async (value: string) => {
            const [semester] = await databaseService.query<Semester[]>(
              'SELECT semesterName FROM Semester WHERE semesterName = ?',
              [value]
            )
            if (semester) {
              throw new ConflictError({ message: SEMESTERS_MESSAGES.SEMESTER_NAME_ALREADY_EXISTS })
            }
            return true
          }
        }
      },
      description: {
        isString: {
          errorMessage: SEMESTERS_MESSAGES.DESCRIPTION_TYPE_INVALID
        },
        optional: true
      },
      startDate: {
        isISO8601: {
          errorMessage: SEMESTERS_MESSAGES.DATE_TYPE_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const [latestSemester] = await databaseService.query<Semester[]>(
              'SELECT endDate FROM Semester ORDER BY endDate DESC LIMIT 1'
            )
            const startDate = parseISO(value)
            const endDate = parseISO(req.body.endDate)
            if (latestSemester && startDate <= latestSemester.endDate) {
              throw new Error(SEMESTERS_MESSAGES.SEMESTERS_OVERLAP)
            }
            if (startDate >= endDate) {
              throw new Error(SEMESTERS_MESSAGES.START_DATE_BEFORE_END_DATE)
            }
            return true
          }
        }
      },
      endDate: {
        isISO8601: {
          errorMessage: SEMESTERS_MESSAGES.DATE_TYPE_INVALID
        },
        custom: {
          options: (value, { req }) => {
            const startDate = parseISO(req.body.startDate)
            const endDate = parseISO(value)
            const weeksDifference = differenceInWeeks(endDate, startDate)
            if (weeksDifference !== 16) {
              throw new Error(SEMESTERS_MESSAGES.INVALID_PERIOD)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const getCurrentPhase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentSemester = req.currentSemester
    if (currentSemester) {
      const currentTime = new Date()
      const [timestamp] = await databaseService.query<{ code: string }[]>(
        `SELECT t.code FROM ${DatabaseTable.Timestamp} AS t JOIN ${DatabaseTable.Semester_Timestamp} AS st ON t.timestampID = st.timestampID
        WHERE st.semesterID = ?
        AND ? BETWEEN st.startDate AND st.endDate`,
        [currentSemester?.semesterID, '2024-07-12 00:00:00']
        // [currentSemester?.semesterID, currentTime]
      )

      if (!timestamp) {
        if (currentSemester?.startDate <= currentTime && currentSemester?.endDate >= currentTime) {
          req.currentPhase = 'IS'
        } else {
          req.currentPhase = 'BS'
        }
      } else {
        req.currentPhase = timestamp.code
      }
      next()
    }
  } catch (error) {
    next(error)
  }
}
