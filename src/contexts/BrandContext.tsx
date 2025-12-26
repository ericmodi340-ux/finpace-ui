import { ReactNode, createContext, useEffect } from 'react';
// hooks
import useLocalStorage from '../hooks/useLocalStorage';
// @type
import { BrandContextProps } from '../@types/brand';
import { UserRole } from '../@types/user';
// redux
import { useSelector } from 'redux/store';
// constants
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

const initialState: BrandContextProps = {
  type: null,
  id: '',
  name: '',
  calendarUrl: '',
};

const BrandContext = createContext(initialState);

type BrandProviderProps = {
  children: ReactNode;
};

function BrandProvider({ children }: BrandProviderProps) {
  const [brand, setBrand] = useLocalStorage('brand', { ...initialState });
  const { firm } = useSelector((state) => state.firm);
  const { advisor } = useSelector((state) => state.advisor);

  useEffect(() => {
    let newBrand: BrandContextProps;

    if (advisor && advisor.name) {
      newBrand = {
        type: roles.ADVISOR as UserRole.ADVISOR,
        id: advisor.id,
        name: advisor.name,
        calendarUrl: advisor.settings?.calendar?.url,
      };
    } else if (firm && firm.name) {
      newBrand = {
        type: 'firm',
        id: firm.id,
        name: firm.name,
        calendarUrl: firm.settings?.calendar?.url,
      };
    } else {
      newBrand = {
        ...initialState,
        type: brand?.type || null,
        id: brand?.id || '',
        name: brand?.name || '',
        calendarUrl: brand?.calendarUrl || '',
      };
    }

    setBrand(newBrand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand?.calendarUrl, brand?.id, brand?.name, brand?.type, firm]);

  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export { BrandProvider, BrandContext };
