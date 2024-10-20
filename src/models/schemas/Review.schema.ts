export enum Rate {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5
}
export interface ReviewType {
  reviewID?: number
  rate: Rate
  description: string
  receiverID: number
  createdAt?: Date
  updatedAt?: Date
}
export class Review {
  reviewID?: number
  rate: Rate
  description: string
  receiverID: number
  createdAt?: Date
  updatedAt?: Date
  constructor({ reviewID, rate, description, receiverID, createdAt, updatedAt }: ReviewType) {
    ; (this.reviewID = reviewID || undefined),
      (this.rate = rate),
      (this.description = description),
      (this.receiverID = receiverID),
      (this.createdAt = createdAt || new Date())
    this.updatedAt = updatedAt || new Date()
  }
}
