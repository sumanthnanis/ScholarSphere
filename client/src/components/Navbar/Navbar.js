import React, { useState, useEffect } from "react";
import Dropdown from "../Dropdown/Dropdown.js";
import logo from "../Img/logo.jpg";
import styles from "./Navbar.module.css";
import MenuItems from "./MenuItems.js";
import Search from "./Search/Search.js";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

function Navbar({
  user,
  setSortBy,
  setCategory,
  handleChange = null,
  searchQuery = null,
  hideCategoriesFilter = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeDropdow, setActiveDropdow] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [isMediumScreen, setIsMediumScreen] = useState(
    window.innerWidth <= 992
  );
  const [isFullScreen, setIsFullScreen] = useState(window.innerWidth > 992);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);

  useEffect(() => {
    const handleResize = () => {
      setIsMediumScreen(window.innerWidth <= 992);
      setIsFullScreen(window.innerWidth > 992);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClick = () => setMenuOpen(!menuOpen);
  const closeMobileMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleMostViewedClick = () => {
    setSortBy("mostViewed");
    closeMobileMenu();
  };

  const handleMostCitedClick = () => {
    setSortBy("mostCited");
    closeMobileMenu();
  };

  const handleCategoryClick = (category) => {
    setCategory(category);
    closeMobileMenu();
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };
  const toggleDropdow = (dropdown) => {
    setActiveDropdow(activeDropdow === dropdown ? null : dropdown);
  };

  const handleMyPapersClick = () => {
    navigate("/user/profile", {
      state: { activeTab: "research-papers" },
    });
  };

  const handleMyListClick = () => {
    navigate("/user/profile", {
      state: { activeTab: "my-list" },
    });
  };

  return (
    <nav id={styles.nav}>
      <div className={styles.logocontainer}>
        <img className={styles.logo} src={logo} alt="logo" />
      </div>
      <div className={styles.menu} onClick={handleClick}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div id={styles.navPart2}>
        <ul className={menuOpen ? styles.open : ""} id={styles.ul}>
          {(data.role === "user" || data.role === "author") &&
            !hideCategoriesFilter &&
            !isMediumScreen && (
              <Search
                authors={authors}
                setAuthors={setAuthors}
                className={styles.search}
                handleChange={handleChange}
                searchQuery={searchQuery}
              />
            )}
          {
            <li className={styles.navLinks}>
              <NavLink className={styles.linked} to="/home">
                Home
              </NavLink>
            </li>
          }

          {(data.role === "user" || data.role === "author") && (
            <>
              <li
                className={`${styles.navLinkss} ${styles.dropdownToggle}`}
                onClick={() => toggleDropdown("categories")}
              >
                Categories <i className="fas fa-caret-down" />
                {activeDropdown === "categories" && (
                  <Dropdown
                    className={styles.dropdown}
                    items={MenuItems}
                    handleCategoryClick={handleCategoryClick}
                  />
                )}
              </li>
              <li
                className={`${styles.navLinkss} ${styles.dropdownToggle}`}
                onClick={() => toggleDropdow("filter")}
              >
                Filter <i className="fas fa-caret-down" />
                {activeDropdow === "filter" && (
                  <ul className={styles.filterDropdown}>
                    <li
                      className={styles.filterItem}
                      onClick={handleMostViewedClick}
                    >
                      Most Viewed
                    </li>
                    <li
                      className={styles.filterItem}
                      onClick={handleMostCitedClick}
                    >
                      Most Cited
                    </li>
                  </ul>
                )}
              </li>
            </>
          )}
          {(data.role === "user" || data.role === "author") &&
            !isMediumScreen && (
              <>
                {data.role === "author" && (
                  <li className={styles.navLinks}>
                    <div
                      onClick={handleMyPapersClick}
                      className={styles.linked}
                    >
                      My Papers
                    </div>
                  </li>
                )}
                {data.role === "author" && (
                  <li className={styles.navLinks}>
                    <NavLink
                      to="/upload"
                      className={styles.linked}
                      state={user}
                    >
                      Publish
                    </NavLink>
                  </li>
                )}
              </>
            )}
          {(data.role === "user" || data.role === "author") && (
            <>
              <button
                onClick={() => toggleDropdown("userMenu")}
                className={isOpen ? "Close" : "Open"}
                id={styles.button}
              >
                <div className={styles.icons}>
                  <i className="fa fa-bars padd" id={styles.icon}></i>
                  <i className="fas fa-user" id={styles.icon}></i>
                </div>
              </button>
              {activeDropdown === "userMenu" && (
                <ul className={styles.menudrop}>
                  <li className={styles.listdrop}>
                    <NavLink className={styles.navitem} to="/user/profile">
                      Your profile
                    </NavLink>
                  </li>
                  <li className={styles.listdrop} onClick={handleMyListClick}>
                    <div className={styles.navitem}>My List</div>
                  </li>
                  {isMediumScreen && (
                    <>
                      <li
                        className={styles.listdrop}
                        onClick={handleMyPapersClick}
                      >
                        <div className={styles.navitem}>My Papers</div>
                      </li>

                      {(data.role === "author" ||
                        data.role === "author-papers") && (
                        <li className={styles.listdrop}>
                          <NavLink className={styles.navitem} to="/upload">
                            Publish
                          </NavLink>
                        </li>
                      )}
                    </>
                  )}
                  <li
                    className={styles.listdrop}
                    onClick={() => handleLogout()}
                  >
                    <div className={styles.navitem}>Logout</div>
                  </li>
                </ul>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
