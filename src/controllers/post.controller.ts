import { Request, Response } from 'express';
import { POSTS_MESSAGES } from '~/constants/messages';
import postService from '~/services/post.services';
import { ParamsDictionary } from 'express-serve-static-core';
import { CreatePostReqBody } from '~/models/Request/Post.request';

export const createPostController = async (
  req: Request<ParamsDictionary, any, CreatePostReqBody>,
  res: Response
) => {
  const { name, description, groupID, techID } = req.body;
  const newPost = await postService.createPost({ name, description, groupID, techID });
  return res.status(201).json({
    message: POSTS_MESSAGES.CREATE_POST_SUCCESS,
    result: newPost
  });
};

export const getPostsController = async (req: Request, res: Response) => {
  const { page, limit, technologies, email, groupMembers } = req.query;

  const posts = await postService.getPosts({
    page: Number(page),
    limit: Number(limit),
    technologies: technologies ? (technologies as string).split(',').map(Number) : undefined,
    email: email ? (email as string).split(',') : undefined,
    groupMembers: groupMembers ? Number(groupMembers) : undefined
  });

  return res.json({
    message: POSTS_MESSAGES.GET_POSTS_SUCCESS,
    result: posts
  });
};

export const getPostDetailController = async (req: Request, res: Response) => {
  const { postID } = req.params;
  const postDetail = await postService.getPostDetail(postID);
  
  if (!postDetail) {
    return res.status(404).json({
      message: "Không tìm thấy bài đăng",
      result: null
    });
  }
  
  return res.status(200).json({
    message: POSTS_MESSAGES.GET_POST_DETAIL_SUCCESS,
    result: postDetail
  });
};
