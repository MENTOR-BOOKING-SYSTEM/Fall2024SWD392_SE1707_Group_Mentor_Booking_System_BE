interface PostType {
  postID: number
  postName: string
  description: string
  projectID: number
  createdAt: Date
  updatedAt: Date
  techName: string
}

export default class Post {
  postID: number
  postName: string
  description: string
  projectID: number
  createdAt: Date
  updatedAt: Date
  techName: string

  constructor(post: PostType) {
    this.postID = post.postID
    this.postName = post.postName
    this.description = post.description
    this.projectID = post.projectID
    this.createdAt = new Date(post.createdAt)
    this.updatedAt = new Date(post.updatedAt)
    this.techName = post.techName
  }
}
