import { v4 as uuidv4 } from 'uuid';
import Post from '~/models/schemas/Post.schema';
import databaseService from './database.services';
import { CreatePostReqBody } from '~/models/Request/Post.request';

interface Guide {
  userID: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
}

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
  
  async getPosts(query: {
    page?: number,
    limit?: number,
    technologies?: number[],
    email?: string[],
    groupMembers?: number
  }) {
    const { page = 1, limit = 10, technologies, email, groupMembers } = query;
    const offset = (page - 1) * limit;

    let sqlQuery = 'SELECT * FROM posts WHERE 1=1';
    const params: any[] = [];

    if (technologies && technologies.length > 0) {
      sqlQuery += ' AND techID IN (?)';
      params.push(technologies);
    }

    if (email && email.length > 0) {
      sqlQuery += ' AND userID IN (SELECT userID FROM users WHERE email IN (?))';
      params.push(email);
    }

    if (groupMembers) {
      sqlQuery += ' AND groupID IN (SELECT groupID FROM groups WHERE memberCount >= ?)';
      params.push(groupMembers);
    }

    sqlQuery += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts: any[] = await databaseService.query(sqlQuery, params);

    // Lấy thông tin chi tiết cho từng bài đăng
    const detailedPosts = await Promise.all(posts.map(async (post: any) => {
      const guide = await databaseService.query<Guide[]>('SELECT userID, avatarUrl, firstName, lastName FROM users WHERE userID = ?', [post.userID]);
      const technologies = await databaseService.query('SELECT techID, techName FROM technologies WHERE techID IN (?)', [post.techID]);
      return {
        ...post,
        guide: guide[0],
        technologies,
        members: await this.getMembersCount(post.groupID)
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

  async getPostDetail(postID: string) {
    const post = await databaseService.query('SELECT * FROM posts WHERE postID = ?', [postID]);
    if (!post || Object.keys(post).length === 0) {
      return null;
    }
    
    const postDetail = (post as any[])[0];
    
    // Lấy thông tin chi tiết của project
    const project = await databaseService.query('SELECT * FROM projects WHERE projectID = ?', [postDetail.projectID]);
    // Lấy thông tin của người hướng dẫn
    const guide = await databaseService.query('SELECT userID, avatarUrl, firstName, lastName FROM users WHERE userID = ?', [postDetail.userID]);
    
    // Lấy thông tin về công nghệ
    const technologies = await databaseService.query('SELECT techID, techName FROM technologies WHERE techID IN (?)', [postDetail.techID]);
    
    // Lấy số lượng thành viên
    const membersCount = await this.getMembersCount(postDetail.groupID);
    
    return {
      ...postDetail,
      project: (project as { projectID: string; projectName: string; }[])[0],
      guide: (guide as { userID: string; avatarUrl: string; firstName: string; lastName: string; }[])[0],
      technologies,
      membersCount
    };
  }
}

const postService = new PostService();
export default postService;
