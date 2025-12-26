import { createContext } from 'react';
//
import { AWSAmplifyContextType } from '../../@types/auth';

// ----------------------------------------------------------------------

export const AuthContext = createContext({} as AWSAmplifyContextType);
