import { Request } from 'express';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface UserRegistration {
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: Date;
}

export interface PostRequest {
  content: string;
}

export interface PostResponse {
  id: number;
  userid: number;
  username: string;
  content: string;
  createdat: string;
}

export interface Follow {
  follower_id: number;
  followee_id: number;
  created_at: Date;
}

export interface FeedResponse {
  page: number;
  posts: PostResponse[];
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export interface JWTPayload {
  id: number;
  username: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: string;
}