import { User } from './user';

export interface UserData extends User {
  isAdmin?: boolean;
  isActive?: boolean;
  data?: {
    storyPoints: number | null;
  };
}

export interface UserAction {
  actionType: string;
  userData: UserData | UserData[];
}
