export interface submitProjectBody {
  projectName: string
  funcRequirements: string
  nonFuncRequirements?: string
  slug: string
  context?: string
  actors: string
  problems?: string
  technologies?: string[]
  collaborators?: string[]
  mentorID: string[],
  type: string
}
