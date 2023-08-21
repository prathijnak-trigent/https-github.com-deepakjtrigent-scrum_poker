import { User } from './user';

export interface UserData extends User {
  isAdmin?: boolean;
  isActive?: boolean;
  data?: {
    storyPoint: number;
  };
}

export interface UserAction {
  actionType: string;
  userData: {[userid: string]: UserData};
}
