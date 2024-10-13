import { Router } from 'express'
import { getAllSemestersController, getSemesterByIdController } from '~/controllers/semester.controller'

const semesterRouter = Router()

semesterRouter.get('/all', getAllSemestersController)
semesterRouter.get('/:semesterID', getSemesterByIdController)

export default semesterRouter