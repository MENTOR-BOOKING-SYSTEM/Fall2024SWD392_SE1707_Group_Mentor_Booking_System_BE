export interface ReviewMember {
  reviews: {
    rate: number
    description: string
    receiverID: number
  }[]
}

export interface AssignReviewerReq {
  semesterID: number
  userIDs: number[]
}
