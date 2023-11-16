import React, { createContext, useContext, useState } from 'react';

const FilteredDataContext = createContext();

export const FilteredDataProvider = ({ children }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [categoriesAndSubcategories, setCategoriesAndSubcategories] = useState({});


  return (
    <FilteredDataContext.Provider value={{ filteredData, setFilteredData, categoriesAndSubcategories, setCategoriesAndSubcategories }}>
      {children}
    </FilteredDataContext.Provider>
  );
};

export const useFilteredData = () => {
  const context = useContext(FilteredDataContext);
  if (context === undefined) {
    throw new Error('useFilteredData debe usarse dentro de un FilteredDataProvider');
  }
  return context;
};
