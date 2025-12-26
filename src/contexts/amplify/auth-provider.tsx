import { useEffect, useReducer, useCallback, useMemo, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Auth } from '@aws-amplify/auth';
import { useSearchParams } from 'react-router-dom';
import { AWSIoTProvider } from '@aws-amplify/pubsub';
import { v4 as uuidv4 } from 'uuid';
import { AuthContext } from './auth-context';
import { ActionMapType, AuthStateType, AuthUserType } from '../../@types/auth';
import { AMPLIFY_CONFIG } from 'config';
import LoadingScreen from 'components/LoadingScreen';
import { Box, Container, Typography } from '@mui/material';
import { RootStyle } from 'components/ProfileCover';

// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGOUT = 'LOGOUT',
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType;
  };
  [Types.LOGOUT]: undefined;
};

type Action = ActionMapType<Payload>[keyof ActionMapType<Payload>];

const initialState: AuthStateType = {
  loading: true,
  user: null,
};

const reducer = (state: AuthStateType, action: Action) => {
  if (action.type === Types.INITIAL) {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === Types.LOGOUT) {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

Amplify.configure(AMPLIFY_CONFIG);

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: import.meta.env.VITE_AWS_PROJECT_REGION,
    aws_pubsub_endpoint: import.meta.env.VITE_AWS_PUBSUB_ENDPOINT,
  })
);

type Props = {
  children: React.ReactNode;
};

type userAttProps = {
  [key: string]: any;
};

const formatUserWithAttributes = (userAtts: userAttProps) => {
  if (!userAtts) {
    return null;
  }

  // Remove 'custom:' from attribute names for cleaner usage on the frontend
  let formattedUserAtts: userAttProps = {};

  Object.keys(userAtts).forEach((att) => {
    formattedUserAtts[att.replace('custom:', '')] = userAtts[att];
  });

  return formattedUserAtts;
};

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Handle custom login via magic links/SSO
  // `?token=`${email},${uuid}`
  const [customLoginError, setCustomLoginError] = useState(null);
  const [customLoginSuccess, setCustomLoginSuccess] = useState(false);

  const finishSignin = async (token: string) => {
    try {
      const [email, code] = token.split(',');
      const userSession = await Auth.signIn(email);
      const user = await Auth.sendCustomChallengeAnswer(userSession, code);
      // await Auth.currentSession(); // TODO: why?? we need to do this to get the idToken, but it's not ideal
      dispatch({
        type: Types.INITIAL,
        payload: {
          user,
        },
      });
      searchParams.delete('token');
      setSearchParams(searchParams);
      setCustomLoginSuccess(true);
    } catch (e) {
      console.error(e);
      searchParams.delete('token');
      setSearchParams(searchParams);
      setCustomLoginError(e);
    }
  };

  const initialize = useCallback(async () => {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();

      if (currentUser) {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: currentUser,
          },
        });
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!token) {
      initialize();
    } else {
      finishSignin(token);
    }
  }, [token, initialize]);

  // LOGIN
  const login = useCallback(async (email: string) => {
    try {
      const user = await Auth.signIn(email.toLowerCase());
      return user;
    } catch (err: any) {
      if (err.code === 'UserNotFoundException') {
        // tell user to signup instead
        throw new Error(
          'User not found! Please create an account if you are new firm, but if you are a client or an advisor please contact your firm admin to create an account for you.'
        );
      }
    }
  }, []);

  // REGISTER
  const register = useCallback(async (email: string, firstName: string, lastName: string) => {
    const { user } = await Auth.signUp({
      username: uuidv4(),
      password: 'Hahaha123!',
      attributes: {
        email: email.toLowerCase(),
        given_name: firstName,
        family_name: lastName,
        name: `${firstName} ${lastName}`,
        'custom:role': 'firm-admin',
        'custom:firmId': uuidv4(),
      },
    });
    return user;
  }, []);

  // CONFIRM REGISTER
  const verifyOtp = useCallback(async (user: any, code: string) => {
    try {
      const currentUser = await Auth.sendCustomChallengeAnswer(user, code);
      if (currentUser.challengeName === 'CUSTOM_CHALLENGE') {
        // eslint-disable-next-line no-throw-literal, @typescript-eslint/no-throw-literal
        throw {
          user: currentUser,
          message: 'Invalid Code, please try again',
        };
      }
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: {
            ...currentUser,
          },
        },
      });
    } catch (err) {
      console.error(err);
      if (err.code === 'NotAuthorizedException') {
        // eslint-disable-next-line no-throw-literal, @typescript-eslint/no-throw-literal
        throw {
          user,
          message: 'Your code has expired, please resend code and try again',
        };
      }
      throw err;
    }
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    await Auth.signOut({ global: true });
    dispatch({
      type: Types.LOGOUT,
    });
  }, []);

  // ----------------------------------------------------------------------

  const memoizedValue = useMemo(
    () => ({
      user: formatUserWithAttributes(state.user?.attributes),
      isAuthenticated: state.user !== null,
      loading: state.loading,
      //
      login,
      logout,
      register,
      verifyOtp,
    }),
    [
      state.user,
      state.loading,
      //
      login,
      logout,
      register,
      verifyOtp,
    ]
  );

  if (customLoginError) {
    return (
      <RootStyle>
        <Container sx={{ flexGrow: 1, padding: 5, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
            <Typography variant="h3" paragraph sx={{ mb: 4 }}>
              Couldn't log you in!
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4 }}>
              Please try again and contact Finpace if the problem persists.
            </Typography>

            <Typography variant="overline" sx={{ display: 'block', textAlign: 'left', mb: 1 }}>
              Error details:
            </Typography>
            <Box
              sx={{
                textAlign: 'left',
                p: 2,
                borderRadius: '16px',
              }}
            >
              <pre style={{ margin: 0 }}>{JSON.stringify(customLoginError, null, 2)}</pre>
            </Box>
          </Box>
        </Container>
      </RootStyle>
    );
  }

  if (token && !customLoginSuccess) {
    return <LoadingScreen message="Signing you in..." startWhiteLabel />;
  }

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
