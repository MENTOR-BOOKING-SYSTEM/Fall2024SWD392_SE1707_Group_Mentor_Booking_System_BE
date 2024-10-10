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
  const posts = await postService.getPosts();
  return res.status(200).json({
    message: POSTS_MESSAGES.GET_POSTS_SUCCESS,
    result: posts
  });
};

export const filterPostsController = async (req: Request, res: Response) => {
  const { skills, groupSize, mentorName } = req.query;
  const skillsArray = Array.isArray(skills) ? skills : skills ? [skills] : undefined;
  const groupSizeValue = groupSize ? Number(groupSize) : undefined; // Sử dụng undefined thay vì null
  const filteredPosts = await postService.filterPosts({ 
    skills: skillsArray as string[], // Đảm bảo rằng skillsArray là một mảng chuỗi
    groupSize: groupSizeValue, // Sử dụng biến đã được xác định
    mentorName: mentorName as string // Đảm bảo rằng mentorName là một chuỗi
  });
  if (filteredPosts) {
    return res.status(200).json({
      message: POSTS_MESSAGES.GET_POSTS_SUCCESS,
      result: filteredPosts
    });
  } else {
    return res.status(404).json({
      message: "Không tìm thấy bài đăng",
      result: null
    });
  }
};

export const searchPostsController = async (req: Request, res: Response) => {
  const { title } = req.query;
  if (typeof title !== 'string') {
    return res.status(400).json({
      message: "Yêu cầu không hợp lệ",
      result: null
    });
  }
  const searchedPosts = await postService.searchPostsByTitle(title);
  return res.status(200).json({
    message: POSTS_MESSAGES.GET_POSTS_SUCCESS,
    result: searchedPosts
  });
};
