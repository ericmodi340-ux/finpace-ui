import React, { createContext, ReactNode, useState } from 'react';

// ----------------------------------------------------------------------

const initialState = {
  openAppTour: false,
  setOpenAppTour: (value: boolean) => {},
};

const AppTourContext = createContext(initialState);

const AppTourContextProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <AppTourContext.Provider
      value={{
        openAppTour: open,
        setOpenAppTour: setOpen,
      }}
    >
      {children}
    </AppTourContext.Provider>
  );
};

export { AppTourContextProvider, AppTourContext };
