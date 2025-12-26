export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUserType = undefined | null | Record<string, any>;

export type AuthStateType = {
  loading: boolean;
  user: AuthUserType;
};

export type AWSAmplifyContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUserType;
  login: (email: string) => Promise<unknown>;
  register: (firstName: string, lastName: string, email: string) => Promise<unknown>;
  logout: () => Promise<unknown>;
  verifyOtp: (user: any, code: string) => Promise<void>;
};
