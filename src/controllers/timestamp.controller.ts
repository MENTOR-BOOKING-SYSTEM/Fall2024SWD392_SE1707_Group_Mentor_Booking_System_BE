import timestampService from '~/services/timestamp.services'
import { Request, Response } from 'express'
import { TIMESTAMP_MESSAGES } from '~/constants/messages'

export const getAllTimestampsController = async (req: Request, res: Response) => {
  const timestamps = await timestampService.getAllTimestamps()

  res.json({
    message: TIMESTAMP_MESSAGES.GET_ALL_TIMESTAMPS_SUCCESSFULLY,
    result: timestamps
  })
}
