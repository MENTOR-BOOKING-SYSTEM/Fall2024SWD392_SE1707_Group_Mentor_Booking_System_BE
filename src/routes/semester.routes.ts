import { Router } from 'express'
import { getAllSemestersController, getSemesterByIdController } from '~/controllers/semester.controller'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { semesterIdValidator } from '~/middlewares/semester.middlewares'

const semesterRouter = Router()

// Áp dụng middleware accessTokenValidator cho tất cả các route
semesterRouter.use(accessTokenValidator)

semesterRouter.get('/all', getAllSemestersController)
semesterRouter.get('/:semesterID', semesterIdValidator, getSemesterByIdController)

export default semesterRouter
