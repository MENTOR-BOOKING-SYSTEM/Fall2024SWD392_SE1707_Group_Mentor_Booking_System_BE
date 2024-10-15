import { Router } from 'express'
import { getAllSemestersController, getSemesterByIdController } from '~/controllers/semester.controller'
import { semesterIdValidator } from '~/middlewares/semester.middlewares'

const semesterRouter = Router()

semesterRouter.get('/all', getAllSemestersController)
semesterRouter.get('/:semesterID', semesterIdValidator, getSemesterByIdController)

export default semesterRouter
