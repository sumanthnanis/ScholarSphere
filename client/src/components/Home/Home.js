import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import styles from "./Home.module.css";
import PaperList from "../Paper/Paper";
import { Toaster } from "sonner";
import Navbar from "../Navbar/Navbar";
import BookmarksContext from "../../BookmarksContext";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleClosePopup,
  fetchProfiles,
  handleCiteThisPaper,
} from "../../utils/util";

const Home = () => {
  const { bookmarkedPapers, setBookmarkedPapers } =
    useContext(BookmarksContext);
  const [papers, setPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [category, setCategory] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [role, setRole] = useState("");
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);
  const [displayedPapers, setDisplayedPapers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const papersPerLoad = 10;
  useEffect(() => {
    fetchProfilesWithRatings();
  }, []);

  useEffect(() => {
    fetchPapers(profiles);
  }, [sortBy, category]);
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

      setPapers([...matchedPapers, ...unmatchedPapers]);

      setBookmarkedPapers(
        papersData.filter((paper) => paper.bookmarkedBy.includes(data.username))
      );
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  useEffect(() => {
    const getPapersBySearch = async () => {
      try {
        if (searchQuery === "") {
          await fetchPapers();
          await fetchProfilesWithRatings();
        } else {
          const response = await axios.get(
            `http://localhost:8000/api/search?search=${searchQuery}`
          );
          const { papers, profiles } = response.data;
          setPapers(papers);
          setProfiles(profiles);
          setBookmarkedPapers(
            papers.filter((paper) => paper.bookmarkedBy.includes(data.username))
          );
        }
      } catch (error) {
        console.error("Error fetching papers:", error);
      }
    };

    getPapersBySearch();
  }, [searchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
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
        <div className={styles["nav-div"]}>
          <Navbar
            setSortBy={setSortBy}
            setCategory={setCategory}
            handleChange={handleSearch}
            searchQuery={searchQuery}
          />
        </div>
        <div className={styles.page}>
          <div className={styles.outputDivWrapper}>
            <div className={styles.outputDiv}>
              <div className={styles.paperheader}>
                {searchQuery ? (
                  <div className={styles.heading}>
                    Search Results for {searchQuery} in Papers
                  </div>
                ) : category ? (
                  <div className={styles.heading}>
                    Showing Papers On {category}
                  </div>
                ) : sortBy ? (
                  <div className={styles.heading}>{sortBy} Papers</div>
                ) : (
                  <div className={styles.heading}>
                    Researches based on your intrests
                  </div>
                )}
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
              />
            </div>
          </div>
          <div className={styles.total}>
            {filteredProfiles.length > 0 && (
              <div className={styles.authorDiv}>
                <div className={styles.headin}>
                  {searchQuery
                    ? `Search Results for ${searchQuery} in Authors`
                    : "Top Authors"}
                </div>
              </div>
            )}
            {filteredProfiles.map((profile, index) => (
              <NavLink
                key={index}
                className={styles.authorCard}
                to={`/user/${encodeURIComponent(profile.username)}`}
              >
                <div className={styles.card}>
                  <div className={styles.profileContainer}>
                    <div className={styles.imageContainer}>
                      {profile.profileImage && (
                        <img
                          src={`http://localhost:8000${profile.profileImage}`}
                          alt={profile.username}
                          className={styles.profileImage}
                        />
                      )}
                    </div>
                    <div className={styles.detailsOverlay}>
                      <div className={styles.userInfo}>
                        <h4 className={styles.userName}>
                          {profile.username}{" "}
                          <span className={styles.statLabel}>
                            ({profile.averageRating})
                          </span>
                        </h4>

                        <p className={styles.userInstitution}>
                          {profile.institution}
                        </p>
                      </div>
                      <div className={styles.stats}>
                        <div className={styles.statItem}>
                          <span className={styles.statNumber}>
                            {profile.totalPapers}
                          </span>
                          <span className={styles.statLabel}>Publications</span>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statItem}>
                          <span className={styles.statNumber}>
                            {profile.totalCitations}
                          </span>
                          <span className={styles.statLabel}>Citations</span>
                        </div>
                        <div className={styles.statDivider}></div>
                        <div className={styles.statItem}>
                          <span className={styles.statNumber}>
                            {profile.totalReads}
                          </span>
                          <span className={styles.statLabel}>Reads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </NavLink>
            ))}
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
                onClick={() =>
                  handleCiteThisPaper(
                    selectedPaper,
                    setPapers,
                    setCopySuccess,
                    papers
                  )
                }
              >
                Copy Citation
              </button>
              {copySuccess && (
                <p className={styles.successMessage}>Copied to clipboard!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
