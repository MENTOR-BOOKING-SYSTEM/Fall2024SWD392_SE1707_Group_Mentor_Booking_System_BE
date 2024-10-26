export interface ApprovalCriteria {
  criteriaID: number
  name: string
  description?: string
  type: string
  createdAt: Date
  updatedAt: Date
}

export interface ApprovalCriteriaType {
  criteriaTypeID: string
  type: string
}
