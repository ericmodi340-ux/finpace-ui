import { useContext } from 'react';
import { AppTourContext } from 'contexts/AppTourContextProvider';

const useAppTour = () => useContext(AppTourContext);

export default useAppTour;
