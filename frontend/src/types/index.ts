export interface User {
  id: number;
  username: string;
}

export interface UserWithFollowStatus {
  id: number;
  username: string;
  isFollowing: boolean;
  joinedAt: string;
}

export interface UserRegistration {
  username: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
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

export interface Post {
  id: number;
  userid: number;
  username: string;
  content: string;
  createdat: string;
}

export interface PostRequest {
  content: string;
}

export interface FeedResponse {
  page: number;
  posts: Post[];
}

export interface UsersResponse {
  users: UserWithFollowStatus[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiError {
  error: string;
}