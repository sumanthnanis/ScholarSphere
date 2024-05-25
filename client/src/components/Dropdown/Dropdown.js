import React from "react";
import "./Dropdown.css";

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
