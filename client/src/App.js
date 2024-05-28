// App.js
import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import AuthorPapers from "./components/AuthorPapers/AuthorPapers";
import Upload from "./components/Upload/Upload";
import PaperPreview from "./components/PaperPreview/PaperPreview";
import Author from "./components/AuthorPapers/Author";
import Profile from "./components/Profile/Profile";
import CategoryPage from "./components/category/category";
import { BookmarksProvider } from "./BookmarksContext";
import { store } from "./reducers/store";
import { Provider } from "react-redux";
import SearchResults from "./components/Navbar/Search/searchResults";
import Navbar from "./components/Navbar/Navbar";

function App() {
  const [state, setState] = useState(false);
  return (
    <BrowserRouter>
      <Provider store={store}>
        {state && <Navbar />}
        <BookmarksProvider>
          <Routes>
            <Route
              path="/"
              element={
                <Login
                  onRender={() => setState(false)}
                  setLoginState={() => setState(true)}
                />
              }
            />
            <Route path="/home" element={<Home />} />
            <Route
              path="/upload"
              element={
                <Upload
                  enterPage={() => setState(false)}
                  exitPage={() => setState(true)}
                />
              }
            />
            <Route path="/my-papers" element={<AuthorPapers />} />
            <Route path="/paper/:id" element={<PaperPreview />} />
            <Route path="/user/:authorName" element={<Author />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/search/:query" element={<SearchResults />} />
          </Routes>
        </BookmarksProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
