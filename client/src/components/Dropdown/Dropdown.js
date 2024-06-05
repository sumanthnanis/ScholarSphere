import React, { useState } from "react";
import "./Dropdown.css"; // Make sure to update this file with appropriate styles

function Dropdown({ items, handleCategoryClick }) {
  const renderMenu = (items) => {
    return (
      <ul className="dropdown-menu">
        {items.map((item, index) => (
          <li
            key={index}
            className={item.cName}
            onClick={() => handleCategoryClick(item.title)}
          >
            {item.title}
          </li>
        ))}
      </ul>
    );
  };
  return renderMenu(items);
}

export default Dropdown;
