interface PostType {
  postID: string
  name: string
  description: string
  groupID: string
  techID: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Post {
  postID: string
  name: string
  description: string
  groupID: string
  techID: string
  createdAt: Date
  updatedAt: Date

  constructor({ postID, name, description, groupID, techID, createdAt, updatedAt }: PostType) {
    this.postID = postID
    this.name = name
    this.description = description
    this.groupID = groupID
    this.techID = techID
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }
}
