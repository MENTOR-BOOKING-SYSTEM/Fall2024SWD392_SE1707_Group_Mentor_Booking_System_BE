import { v4 as uuidv4 } from 'uuid';
import Post from '~/schemas/Post.schema';
import databaseService from './database.services';
import { CreatePostReqBody } from '~/schemas/Request/Post.request';

class PostService {
  async createPost({ name, description, groupID, techID }: CreatePostReqBody) {
    const postID = uuidv4();
    const newPost = new Post({ postID, name, description, groupID, techID });
    await databaseService.query(
      'INSERT INTO posts (postID, name, description, groupID, techID, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newPost.postID, newPost.name, newPost.description, newPost.groupID, newPost.techID, newPost.createdAt.toISOString(), newPost.updatedAt.toISOString()]
    );
    return newPost;
  }
  async getPosts() {
    const posts = await databaseService.query('SELECT * FROM posts');
    return posts;
  }
}

const postService = new PostService();
export default postService;
