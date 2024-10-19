import databaseService from './database.services'
import { Timestamp } from '~/models/schemas/Timestamp.schema'
import { DatabaseTable } from '~/constants/databaseTable'

class TimestampService {
  async getAllTimestamps() {
    const timestamps = await databaseService.query<Timestamp[]>(
      `SELECT timestampID, timestampName, phase FROM ${DatabaseTable.Timestamp}`
    )
    return timestamps
  }
}

const timestampService = new TimestampService()
export default timestampService
