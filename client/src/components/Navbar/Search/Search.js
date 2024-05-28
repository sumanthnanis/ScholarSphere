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
    console.log(value);
    setSearchTerm(value);
    navigate(`/search/${value}`);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const value = encodeURIComponent(searchTerm);
    // setSearchTerm(value); // Encode the search term
    // navigate(`/search/${value}`);
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchBar}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search By PaperName/Author"
          value={searchTerm}
          onChange={handleChange}
          className={styles.searchInput}
        />
      </form>
    </div>
  );
};

export default Search;
// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";
// import styles from "./Search.module.css";
// import { useNavigate, useLocation } from "react-router-dom";

// const Search = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);

//     if (value) {
//       const encodedSearchTerm = encodeURIComponent(value);
//       navigate(`/search/${encodedSearchTerm}`, { replace: true });
//     } else {
//       navigate("/home", { replace: true });
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const encodedSearchTerm = encodeURIComponent(searchTerm);
//     navigate(`/search?search=${encodedSearchTerm}`);
//   };

//   return (
//     <div className={styles.searchContainer}>
//       <form onSubmit={handleSubmit} className={styles.searchBar}>
//         <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
//         <input
//           type="text"
//           placeholder="Search By PaperName/Author"
//           value={searchTerm}
//           onChange={handleChange}
//           className={styles.searchInput}
//         />
//       </form>
//     </div>
//   );
// };

// export default Search;
