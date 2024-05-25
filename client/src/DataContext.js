import React, { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [globalData, setGlobalData] = useState(null);

  return (
    <DataContext.Provider value={{ globalData, setGlobalData }}>
      {children}
    </DataContext.Provider>
  );
};
