import { Request, Response } from 'express';
import { POSTS_MESSAGES } from '~/constants/messages';
import postService from '~/services/post.services';
import { ParamsDictionary } from 'express-serve-static-core';
import { CreatePostReqBody } from '~/schemas/Request/Post.request';

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