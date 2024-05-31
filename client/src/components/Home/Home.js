import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./Home.module.css";
import PaperList from "../Paper/Paper";
import { Toaster } from "sonner";
import PopupComponent from "../../utils/PopupComponent";
import BookmarksContext from "../../BookmarksContext";
import ToggleDropdown from "../Dropdown/ToggleDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleClosePopup,
  fetchProfiles,
  handleCopyCitation,
} from "../../utils/util";
import AuthorList from "./AuthorList";

const Home = ({ getNavigatoin }) => {
  getNavigatoin();
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
    window.innerWidth < 810 ? "papers" : "all"
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
      if (window.innerWidth < 810) {
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

  const fetchPapers = async () => {
    try {
      const url = "http://localhost:8000/api/get-papers";
      const params = new URLSearchParams();
      params.append("sortBy", "publicationDate");
      params.append("order", "desc");

      if (category) {
        params.append("category", category.trim());
      }

      const response = await axios.get(url + `?${params.toString()}`);
      let papersData = response.data;

      if (sortBy === "mostViewed") {
        papersData.sort((a, b) => b.count - a.count);
      }

      if (sortBy === "mostCited") {
        papersData.sort((a, b) => b.citations - a.citations);
      }

      setPapers(papersData);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };
  const handlePopupClose = () => {
    handleClosePopup(setShowPopup, setSelectedPaper);
  };

  const handleCopyCitationWrapper = async (paper) => {
    await handleCopyCitation(paper, setIndividualCopySuccess, papers);
    setPapers((prevPapers) =>
      prevPapers.map((p) =>
        p._id === paper._id ? { ...p, citations: p.citations + 1 } : p
      )
    );
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
  const updateCitationCount = (paperId) => {
    setPapers((prevPapers) =>
      prevPapers.map((paper) =>
        paper._id === paperId
          ? { ...paper, citations: paper.citations + 1 }
          : paper
      )
    );
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
        <div className={styles.filterDropdown}>
          <ToggleDropdown onFilterChange={handleFilterChange} />
        </div>
        <div className={styles.page}>
          {(activeTab === "all" || activeTab === "papers") && (
            <>
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
                      <ul className={styles.filterDropdownViews}>
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
                  showPdf={(fileName) => showPdf(fileName, setPapers, papers)}
                  handleCitePopup={(paper) =>
                    handleCitePopup(paper, setSelectedPaper, setShowPopup)
                  }
                  handleCopyCitation={handleCopyCitationWrapper}
                  individualCopySuccess={individualCopySuccess}
                  updateCitationCount={updateCitationCount}
                  excludeCurrentUser={true}
                />
              </div>
              {(activeTab === "authors" || activeTab === "all") && (
                <AuthorList
                  profiles={filteredProfiles}
                  searchQuery={searchQuery}
                />
              )}
            </>
          )}
          {activeTab === "authors" && (
            <AuthorList profiles={filteredProfiles} searchQuery={searchQuery} />
          )}
        </div>
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
      {showPopup && selectedPaper && (
        <PopupComponent
          content={`${selectedPaper.uploadedBy}. ${selectedPaper.title}`}
          onClose={handlePopupClose}
          handleCopyCitation={handleCopyCitationWrapper}
          paper={selectedPaper}
          individualCopySuccess={individualCopySuccess}
        />
      )}
    </>
  );
};

export default Home;
