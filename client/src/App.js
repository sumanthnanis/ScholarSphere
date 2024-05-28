// App.js
import React from "react";
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

function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <BookmarksProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/my-papers" element={<AuthorPapers />} />
            <Route path="/paper/:id" element={<PaperPreview />} />
            <Route path="/user/:authorName" element={<Author />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/user/profile" element={<Profile />} />
          </Routes>
        </BookmarksProvider>
      </Provider>
    </BrowserRouter>
  );
}

export default App;
