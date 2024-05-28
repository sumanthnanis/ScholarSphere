import React, { useState } from "react";
import Dropdown from "./Dropdown";
import "./ToggleDropdown.css";

const Filterdropdownn = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filterOptions = [
    { title: "Papers", cName: "dropdownn-link" },
    { title: "Authors", cName: "dropdownn-link" },
  ];

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter.title);
    onFilterChange(filter);
    setIsOpen(false);
  };

  return (
    <div className="dropdownn">
      <div className="dropdownn-btn" onClick={() => setIsOpen(!isOpen)}>
        Filter by content type:{" "}
        <span className="dropdownnName">Research Papers</span>{" "}
        <i className={isOpen ? "fa fa-caret-up" : "fa fa-caret-down"} />
      </div>
      {isOpen && (
        <Dropdown
          items={filterOptions}
          handleCategoryClick={handleFilterClick}
        />
      )}
    </div>
  );
};

export default Filterdropdownn;
