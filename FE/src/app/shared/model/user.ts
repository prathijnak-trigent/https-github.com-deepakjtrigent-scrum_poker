export interface User {
  userId: string;
  displayName: string;
  jobRole? :string,
}

export const defaultsUser: Pick<User, 'userId' | 'displayName' | 'jobRole'> = {
  userId: '',
  displayName: '',
  jobRole :'' 
};
