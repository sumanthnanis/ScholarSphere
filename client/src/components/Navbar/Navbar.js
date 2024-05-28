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

  setCategory,
  handleChange = null,
  searchQuery = null,
  hideCategoriesFilter = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [isMediumScreen, setIsMediumScreen] = useState(
    window.innerWidth <= 992
  );
  const [isFullScreen, setIsFullScreen] = useState(window.innerWidth > 1070);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);

  useEffect(() => {
    const handleResize = () => {
      setIsMediumScreen(window.innerWidth <= 1070);
      setIsFullScreen(window.innerWidth > 1070);
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

  const handleCategoryClick = (category) => {
    navigate(`/category/${category}`);
    closeMobileMenu();
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
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
        <NavLink to="/home">
          <img className={styles.logo} src={logo} alt="logo" />
        </NavLink>
      </div>
      <div className={styles.menu} onClick={handleClick}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div id={styles.navPart2}>
        <ul className={menuOpen ? styles.open : ""} id={styles.ul}>
          {(data.role === "user" || data.role === "author") && (
            <Search
              authors={authors}
              setAuthors={setAuthors}
              className={styles.search}
              handleChange={handleChange}
              searchQuery={searchQuery}
            />
          )}

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
                      Add a paper
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
