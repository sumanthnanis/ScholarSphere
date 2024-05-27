import { useState } from "react";

const useSearchAndSort = () => {
  const [sortBy, setSortBy] = useState("");
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return {
    sortBy,
    setSortBy,
    category,
    setCategory,
    searchQuery,
    handleSearch,
  };
};

export default useSearchAndSort;
