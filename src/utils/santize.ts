import express from 'express'
import { validationResult } from 'express-validator'

export const sanitizeBodyFields = (allowedFields: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const bodyFields = Object.keys(req.body)
    bodyFields.forEach((field) => {
      if (!allowedFields.includes(field)) {
        delete req.body[field]
      }
    })

    next()
  }
}
