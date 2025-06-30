export interface Post {
  id: string;
  type: 'job' | 'campaign' | 'news' | 'update';
  authorId: string;
  author: PostAuthor;
  title: string;
  content: string;
  media?: PostMedia[];
  tags: string[];
  likes: number;
  shares: number;
  comments: Comment[];
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostAuthor {
  id: string;
  name: string;
  profilePicture?: string;
  role: string;
  company?: string;
  isVerified: boolean;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  alt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: CommentAuthor;
  content: string;
  parentId?: string; // For replies
  replies?: Comment[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentAuthor {
  id: string;
  name: string;
  profilePicture?: string;
  role: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  userId: string;
  name: string;
  profilePicture?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'application' | 'shortlist' | 'message' | 'connection' | 'job_match' | 'post_like' | 'comment';
  title: string;
  message: string;
  data?: any; // Additional context data
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}
