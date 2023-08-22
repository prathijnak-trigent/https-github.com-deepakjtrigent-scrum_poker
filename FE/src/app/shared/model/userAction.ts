import { User } from './user';

export interface UserData extends User {
  isAdmin?: boolean;
  isActive?: boolean;
  data?: {
    storyPoints: number;
  };
}

export interface UserAction {
  actionType: string;
  userData: {[userId: string]: UserData}
}
