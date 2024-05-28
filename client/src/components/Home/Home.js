import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./Home.module.css";
import PaperList from "../Paper/Paper";
import { Toaster } from "sonner";
import Navbar from "../Navbar/Navbar";
import BookmarksContext from "../../BookmarksContext";
import ToggleDropdown from "../Dropdown/ToggleDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleClosePopup,
  fetchProfiles,
  handleCiteThisPaper,
} from "../../utils/util";
import AuthorList from "./AuthorList";

const Home = () => {
  const { bookmarkedPapers, setBookmarkedPapers } =
    useContext(BookmarksContext);
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [category, setCategory] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [role, setRole] = useState("");
  const [sortBy, setSortBy] = useState("");

  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(
    window.innerWidth < 768 ? "papers" : "all"
  );
  const data = useSelector((prev) => prev.auth.user);
  const [displayedPapers, setDisplayedPapers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [individualCopySuccess, setIndividualCopySuccess] = useState({});
  const papersPerLoad = 10;

  const handleFilterChange = (filter) => {
    switch (filter) {
      case "Papers":
        setActiveTab("papers");
        break;
      case "Authors":
        setActiveTab("authors");
        break;

      default:
        setActiveTab("all");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setActiveTab("papers");
      } else {
        setActiveTab("all");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchProfilesWithRatings();
  }, []);
  const handleMostViewedClick = () => {
    setSortBy("mostViewed");
  };

  const handleMostCitedClick = () => {
    setSortBy("mostCited");
  };

  useEffect(() => {
    fetchPapers();
  }, [category, sortBy]);

  useEffect(() => {
    const loadInitialPapers = () => {
      setDisplayedPapers(papers.slice(0, papersPerLoad));
    };

    loadInitialPapers();
  }, [papers]);

  const fetchPapers = async (profilesData = profiles) => {
    try {
      let url = "http://localhost:8000/api/get-papers";
      const params = new URLSearchParams();
      params.append("sortBy", "publicationDate");
      params.append("order", "desc");

      if (sortBy === "mostViewed") {
        params.append("sortBy", "viewCount");
      }
      if (sortBy === "mostCited") {
        params.append("sortBy", "citationCount");
      }

      if (category) {
        params.append("category", category.trim());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await axios.get(url);
      const papersData = response.data;
      console.log("hiiiiiiiiiii", papersData);
      const userProfile = profiles.find(
        (profile) => profile.username === data.username
      );
      console.log(profiles);
      const userSkillsString = userProfile
        ? userProfile.skills.toLowerCase()
        : "";
      const userSkills = userSkillsString ? userSkillsString.split(",") : [];

      const matchedPapers = papersData.filter((paper) => {
        const paperCategories = paper.categories.map((category) =>
          category.toLowerCase()
        );
        return (
          userSkills &&
          userSkills.some((skill) => paperCategories.includes(skill))
        );
      });

      matchedPapers.sort(
        (a, b) => new Date(b.publicationDate) - new Date(a.publicationDate)
      );

      const unmatchedPapers = papersData.filter((paper) => {
        const paperCategories = paper.categories.map((category) =>
          category.toLowerCase()
        );
        return (
          !userSkills ||
          !userSkills.some((skill) => paperCategories.includes(skill))
        );
      });

      unmatchedPapers.sort(
        (a, b) => new Date(b.publicationDate) - new Date(a.publicationDate)
      );

      // setPapers([...matchedPapers, ...unmatchedPapers]);
      setPapers(papersData);
      setBookmarkedPapers(
        papersData.filter((paper) => paper.bookmarkedBy.includes(data.username))
      );
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  const aggregatedProfiles = profiles
    .map((profile) => {
      const authorPapers = papers.filter(
        (paper) => paper.uploadedBy === profile.username
      );

      // Calculate totals
      const totalPapers = authorPapers.length;
      const totalCitations = authorPapers.reduce(
        (sum, paper) => sum + paper.citations,
        0
      );
      const totalReads = authorPapers.reduce(
        (sum, paper) => sum + paper.count,
        0
      );

      if (totalPapers > 0) {
        return {
          username: profile.username,
          totalPapers,
          totalCitations,
          totalReads,
          profileImage: profile.profileImage,
          institution: profile.institution,
          averageRating: profile.averageRating || 0,
        };
      } else {
        return null;
      }
    })
    .filter((profile) => profile !== null);

  useEffect(() => {
    localStorage.setItem("role", role);
  }, [role]);

  const sortedProfiles = [...aggregatedProfiles].sort(
    (a, b) => b.averageRating - a.averageRating
  );

  const filteredProfiles = searchQuery
    ? sortedProfiles.filter((profile) =>
        profile.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedProfiles;
  console.log("these are the papers", papers);
  const fetchProfilesWithRatings = async () => {
    try {
      const profileData = await fetchProfiles();
      const profilesWithRatings = await Promise.all(
        profileData.map(async (profile) => {
          const response = await axios.get(
            `http://localhost:8000/api/get-author-ratings/${profile.username}`
          );
          const { averageRating } = response.data;
          return { ...profile, averageRating: averageRating || 0 };
        })
      );
      setProfiles(profilesWithRatings);
    } catch (error) {
      console.error("Error fetching profiles with ratings:", error);
    }
  };

  const handleCopyCitation = async (paper) => {
    try {
      await handleCiteThisPaper(
        paper,
        setPapers,
        (value) => {
          setIndividualCopySuccess((prev) => ({
            ...prev,
            [paper._id]: value,
          }));
        },
        papers
      );
    } catch (error) {
      console.error("Error copying citation:", error);
    }
  };
  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const loadMorePapers = () => {
    const nextPagePapers = papers.slice(
      displayedPapers.length,
      displayedPapers.length + papersPerLoad
    );
    setDisplayedPapers((prevPapers) => [...prevPapers, ...nextPagePapers]);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        loadMorePapers();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [displayedPapers]);

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className={styles["home-root"]}>
        <div className={styles["nav-div"]}></div>
        <div className={styles.filterDropdown}>
          <ToggleDropdown onFilterChange={handleFilterChange} />
        </div>
        <div className={styles.page}>
          {(activeTab === "all" || activeTab === "papers") && (
            <>
              <div className={styles.pagemerger}>
                <div className={styles.outputDiv}>
                  <div className={styles.paperHeader}>
                    {searchQuery ? (
                      <div className={styles.heading}>
                        Search Results for {searchQuery} in Papers
                      </div>
                    ) : category ? (
                      <div className={styles.heading}>
                        Showing Papers On {category}
                      </div>
                    ) : (
                      <div className={styles.heading}>
                        Researches based on your interests
                      </div>
                    )}

                    <div
                      className={`${styles.navLinkss} ${styles.dropdownToggle}`}
                      onClick={() => toggleDropdown("filter")}
                    >
                      Filter <i className="fas fa-caret-down" />
                      {activeDropdown === "filter" && (
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
                    </div>
                  </div>
                  <PaperList
                    papers={displayedPapers}
                    bookmarks={displayedPapers.map((paper) =>
                      bookmarkedPapers.some((bp) => bp._id === paper._id)
                    )}
                    toggleBookmark={(index, id) =>
                      toggleBookmark(
                        index,
                        id,
                        displayedPapers,
                        bookmarkedPapers,
                        setPapers,
                        setBookmarkedPapers,
                        data.username
                      )
                    }
                    showPdf={showPdf}
                    handleCitePopup={(paper) =>
                      handleCitePopup(paper, setSelectedPaper, setShowPopup)
                    }
                    handleCopyCitation={handleCopyCitation}
                    individualCopySuccess={individualCopySuccess}
                  />
                </div>
                {(activeTab === "authors" || activeTab === "all") && (
                  <AuthorList
                    profiles={filteredProfiles}
                    searchQuery={searchQuery}
                  />
                )}
              </div>
            </>
          )}
          {activeTab === "authors" && (
            <AuthorList profiles={filteredProfiles} searchQuery={searchQuery} />
          )}
        </div>
        <div className={styles.tabsSidebar}>
          <div
            className={`${styles.tabLink} ${
              activeTab === "papers" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("papers")}
          >
            Papers
          </div>
          <div
            className={`${styles.tabLink} ${
              activeTab === "authors" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("authors")}
          >
            Authors
          </div>
        </div>
      </div>
      {showPopup && selectedPaper && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <span
              className={styles.close}
              onClick={() => handleClosePopup(setShowPopup, setSelectedPaper)}
            >
              &times;
            </span>
            <h2 className={styles.citePaper}>Cite Paper</h2>
            <p>
              {selectedPaper.uploadedBy}. {selectedPaper.title}
            </p>
            <button
              className={styles.copyButton}
              onClick={() => handleCopyCitation(selectedPaper)}
            >
              {individualCopySuccess[selectedPaper._id]
                ? "Cited"
                : "Copy Citation"}
            </button>
            {individualCopySuccess[selectedPaper._id] && (
              <p className={styles.successMessage}>Copied to clipboard!</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
