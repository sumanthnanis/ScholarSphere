import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BookmarksProvider } from "./BookmarksContext";

ReactDOM.render(
  <BookmarksProvider>
    <App />
  </BookmarksProvider>,
  document.getElementById("root")
);
