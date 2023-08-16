import { User } from './user'; 

export interface UserData {
  user: User;
  isAdmin? : boolean;
  isActive?: boolean;
  data?: {
    storyPoint: number;
  };
}

export interface UserAction {
  actionType: string;
  userData: UserData;
}
