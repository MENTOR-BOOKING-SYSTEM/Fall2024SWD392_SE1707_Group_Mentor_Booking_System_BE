export interface TechnologyType {
  techID?: string | null
  techName: string
}
export default class Technology {
  techID: string | null
  techName: string
  constructor({ techID, techName }: TechnologyType) {
    this.techID = techID || null
    this.techName = techName
  }
}
