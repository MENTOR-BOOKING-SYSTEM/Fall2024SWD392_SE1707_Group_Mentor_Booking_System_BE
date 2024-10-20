export interface ReviewMember {
  reviews: {
    rate: number,
    description: string,
    receiverID: number
  }[]

}