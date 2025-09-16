import { createContext, useState, useContext } from "react";

const Language = createContext();

export const LanguageProvider = ({ children }) => {
  const [Language, setLanguage] = useState("es"); // "es", "en", "pt"

  return (
    <Language.Provider value={{ language, setLanguage }}>
      {children}
    </Language.Provider>
  );
};

export const useLanguage = () => useContext(Language);
