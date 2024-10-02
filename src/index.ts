import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import databaseService from './services/database.services'
import usersRouter from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { verifyToken } from './utils/jwt'
import { envConfig } from './constants/config'
import { config } from 'dotenv'
config()

databaseService.connect()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const port = envConfig.port
app.use(cors())
app.use('/users', usersRouter)
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port} `)
})
