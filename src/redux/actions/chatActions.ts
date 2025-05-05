import { createAsyncThunk } from '@reduxjs/toolkit';
import { serverUser } from '../../services';
import { userEndPoints } from '../../services/endPoints/endPoints';

export interface IResponse {
  success: boolean;
  message: string;
  data?: unknown;
  redirectURL?: string;
  error?: {
    message: string;
    field?: string;
    statusCode?: number;
  };
  token?: string;
  refreshToken?: string;
  userData?: any;
}

export interface IChat {
  _id: string;
  courseId: string;
  senderId: {
    _id: string;
    name: string;
    role: string;
    profile?: {
      profilePic?: string;
    };
  };
  message: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface GetMessagesParams {
  courseId: string;
  page?: number;
  limit?: number;
}

interface SendMessageData {
  courseId: string;
  message: string;
}

export const getMessagesThunk = createAsyncThunk<
  IResponse,
  GetMessagesParams,
  { rejectValue: string | IResponse }
>(
  'chat/getMessages',
  async ({ courseId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      console.log('Fetching messages for course:', courseId, 'Page:', page, 'Limit:', limit);
      const response = await serverUser.get(userEndPoints.getMessages(courseId, page, limit));
      console.log('Get messages response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching messages:', error.response?.data);
      return rejectWithValue(error.response?.data || 'Failed to fetch messages');
    }
  }
);

export const sendMessageThunk = createAsyncThunk<
  IResponse,
  SendMessageData,
  { rejectValue: string | IResponse }
>(
  'chat/sendMessage',
  async ({ courseId, message }, { rejectWithValue }) => {
    try {
      console.log('Sending message to course:', courseId, 'Message:', message);
      const response = await serverUser.post(userEndPoints.sendMessage(courseId), { message });
      console.log('Send message response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error.response?.data);
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);