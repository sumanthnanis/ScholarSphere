import React, { createContext, useState } from "react";

const BookmarksContext = createContext();

export const BookmarksProvider = ({ children }) => {
  const [bookmarkedPapers, setBookmarkedPapers] = useState([]);

  return (
    <BookmarksContext.Provider
      value={{ bookmarkedPapers, setBookmarkedPapers }}
    >
      {children}
    </BookmarksContext.Provider>
  );
};

export default BookmarksContext;
