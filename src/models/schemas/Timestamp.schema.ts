export interface TimestampType {
  timestampID?: number
  timestampName: string
  startDate: Date
  endDate: Date
  phase: number
}

export class Timestamp {
  timestampID: number | null
  timestampName: string
  startDate: Date
  endDate: Date
  phase: number
  constructor({ timestampID, timestampName, startDate, endDate, phase }: TimestampType) {
    this.timestampID = timestampID || null
    this.timestampName = timestampName
    this.startDate = startDate
    this.endDate = endDate
    this.phase = phase
  }
}
