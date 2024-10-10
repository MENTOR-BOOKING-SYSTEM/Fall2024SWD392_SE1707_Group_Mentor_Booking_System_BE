import { v4 as uuidv4 } from 'uuid';
import Post from '~/models/schemas/Post.schema';
import databaseService from './database.services';
import { CreatePostReqBody } from '~/models/Request/Post.request';

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
    const posts: any[] = await databaseService.query('SELECT * FROM posts');
    // Cần thêm logic để lấy thông tin chi tiết cho từng bài đăng
    const detailedPosts = await Promise.all(posts.map(async (post: any) => {
      const guide = await databaseService.query('SELECT userID, avatarUrl, firstName, lastName FROM users WHERE userID = ?', [post.userID]);
      const technologies = await databaseService.query('SELECT techID, techName FROM technologies WHERE techID IN (?)', [post.techID]);
      return {
        ...post,
        guide,
        technologies,
        members: await this.getMembersCount(post.groupID) // Giả sử có phương thức để lấy số lượng thành viên
      };
    }));
    return detailedPosts;
  }

  private async getMembersCount(groupID: string) {
    const count = await databaseService.query<{ count: number }>('SELECT COUNT(*) as count FROM group_members WHERE groupID = ?', [groupID]);
    return count ? count.count : 0; // Trả về 0 nếu không tìm thấy nhóm
  }

  async filterPosts({ skills, groupSize, mentorName }: { skills?: string[], groupSize?: number, mentorName?: string }) {
    const query = `
      SELECT * FROM posts
      WHERE (techID IN (?) OR ? IS NULL)
      AND (groupID IN (SELECT groupID FROM groups WHERE memberCount >= ? OR ? IS NULL))
      AND (userID IN (SELECT userID FROM users WHERE firstName LIKE ? OR lastName LIKE ? OR ? IS NULL))
    `;
    const posts = await databaseService.query(query, [
      skills ? skills.join(',') : null,
      skills ? skills.join(',') : null,
      groupSize ? groupSize : null,
      groupSize ? groupSize : null,
      `%${mentorName}%`,
      mentorName ? `%${mentorName}%` : null,
      mentorName ? `%${mentorName}%` : null,
      mentorName ? mentorName : null
    ]);
    
    return posts;
  }

  async searchPostsByTitle(title: string) {
    const posts = await databaseService.query('SELECT * FROM posts WHERE name LIKE ?', [`%${title}%`]);
    return posts;
  }
}

const postService = new PostService();
export default postService;
