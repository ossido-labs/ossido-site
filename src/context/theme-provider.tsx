/* oxlint-disable react-refresh/only-export-components */

import React, { createContext, useState } from 'react';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
  System = 'system'
}

interface IThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<IThemeContext>({
  theme: Theme.System,
  setTheme: () => {
    //
  },
});

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // State
  const [theme, setTheme] = useState(Theme.System);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}