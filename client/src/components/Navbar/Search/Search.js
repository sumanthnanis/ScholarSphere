import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "./Search.module.css";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;

    setSearchTerm(value);
    if (value.trim() === "") {
      navigate(`/home`);
    } else {
      navigate(`/search/${value}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = encodeURIComponent(searchTerm);
    navigate(`/search/${query}`);
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchBar}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search By PaperTitle/Author"
          value={searchTerm}
          onChange={handleChange}
          className={styles.searchInput}
        />
      </form>
    </div>
  );
};

export default Search;
