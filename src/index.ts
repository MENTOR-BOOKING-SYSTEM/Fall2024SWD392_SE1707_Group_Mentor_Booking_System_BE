import express from 'express'
import { Router } from 'express';
import 'dotenv/config'
import cors from 'cors'
import databaseService from './services/database.services'
import usersRouter from './routes/users.routes'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import { verifyToken } from './utils/jwt'
import { envConfig } from './constants/config'
import { config } from 'dotenv'
import postsRouter from './routes/posts.routes';
import groupsRouter from './routes/groups.routes'
import technologyRouter from './routes/technologies.routes'
import projectRouter from './routes/projects.routes'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
config()
initFolder()
databaseService.connect()
const app = express()
const router = Router()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const port = envConfig.port
app.use(cors())

app.use('/users', usersRouter)
app.use('/posts', postsRouter)
app.use('/groups', groupsRouter)
app.use('/technologies', technologyRouter)
app.use('/projects', projectRouter)
app.use("/medias", mediasRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port} `)
})
