import { useContext } from 'react';
import { BrandContext } from '../contexts/BrandContext';

// ----------------------------------------------------------------------

const useBrand = () => useContext(BrandContext);

export default useBrand;
