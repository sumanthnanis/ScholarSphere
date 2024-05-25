import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "./Search.module.css";

const Search = ({ handleChange, searchQuery }) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search By PaperName/Author"
          value={searchQuery}
          onChange={handleChange}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
};

export default Search;
