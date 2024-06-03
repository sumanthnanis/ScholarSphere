import React, { useState, useEffect } from "react";
import PaperList from "../Paper/Paper";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./AuthorHome.module.css";
import FilterDropdown from "../Dropdown/FilterDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  showPdf,
  handleCitePopup,
  handleCopyCitation,
  fetchProfiles,
  handleClosePopup,
} from "../../utils/util";
import PopupComponent from "../../utils/PopupComponent";

const AuthorHome = ({ getNavigatoin }) => {
  console.log("hiiiii");
  getNavigatoin();
  const [draft0Papers, setDraft0Papers] = useState([]);

  const [draft1Papers, setDraft1Papers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [paper, setPaper] = useState([]);

  const dispatch = useDispatch();
  const data = useSelector((state) => state.auth.user);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [individualCopySuccess, setIndividualCopySuccess] = useState({});
  const navigate = useNavigate();

  const handleFilterChange = (filter) => {
    switch (filter) {
      case "All":
        setActiveTab("all");
        break;
      case "Published Papers":
        setActiveTab("published");
        break;
      case "Drafts":
        setActiveTab("drafts");
        break;
      default:
        setActiveTab("all");
    }
  };

  const handlePopupClose = () => {
    handleClosePopup(setShowPopup, setSelectedPaper);
  };

  const handleCopyCitationWrapper = async (paper) => {
    await handleCopyCitation(paper, setIndividualCopySuccess);
    setDraft0Papers((prevPapers) =>
      prevPapers.map((p) =>
        p._id === paper._id ? { ...p, citations: p.citations + 1 } : p
      )
    );
    setDraft1Papers((prevPapers) =>
      prevPapers.map((p) =>
        p._id === paper._id ? { ...p, citations: p.citations + 1 } : p
      )
    );
  };

  const fetchPapers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/papers/${data.username}`
      );

      const draft0 = response.data.filter((paper) => paper.draft === 0);
      const draft1 = response.data.filter((paper) => paper.draft === 1);

      setDraft0Papers(draft0);
      setDraft1Papers(draft1);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };
  const fetchAllPapers = async () => {
    try {
      const url = "http://localhost:8000/api/get-papers";
      const response = await axios.get(url);
      let papersData = response.data;
      setPaper(papersData);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

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

  useEffect(() => {
    if (data.username) {
      fetchPapers();
    }
  }, [data.username]);

  useEffect(() => {
    fetchAllPapers();
    fetchProfilesWithRatings();
  }, []);

  const aggregatedProfiles = profiles
    .filter((profile) => {
      const isAuthorWithPaper = paper.some(
        (p) => p.uploadedBy === profile.username
      );
      return isAuthorWithPaper;
    })
    .map((profile) => {
      const authorPapers = paper.filter(
        (p) => p.uploadedBy === profile.username
      );

      const totalPapers = authorPapers.length;
      const totalCitations = authorPapers.reduce(
        (sum, p) => sum + p.citations,
        0
      );
      const totalReads = authorPapers.reduce((sum, p) => sum + p.count, 0);

      return {
        username: profile.username,
        totalPapers,
        totalCitations,
        totalReads,
        profileImage: profile.profileImage,
        institution: profile.institution,
        averageRating: profile.averageRating || 0,
      };
    });

  const sortedProfiles = [...aggregatedProfiles].sort(
    (a, b) => b.averageRating - a.averageRating
  );

  const handleDelete = async (paperId) => {
    try {
      await axios.delete(`http://localhost:8000/api/papers/${paperId}`);

      setDraft0Papers(draft0Papers.filter((paper) => paper._id !== paperId));
      setDraft1Papers(draft1Papers.filter((paper) => paper._id !== paperId));
      toast.success("Paper deleted successfully");
    } catch (error) {
      console.error("Error deleting paper:", error);
      toast.error("Failed to delete paper");
    }
  };

  const handleDraft = async (filename, newDraftStatus) => {
    try {
      await axios.put(
        `http://localhost:8000/api/papers/${encodeURIComponent(filename)}`,
        {
          draft: newDraftStatus,
        }
      );

      if (newDraftStatus === 0) {
        setDraft1Papers((prevDrafts) =>
          prevDrafts.map((paper) =>
            paper.filename === filename ? { ...paper, draft: 0 } : paper
          )
        );
        toast.success("Paper published successfully");
      } else {
        setDraft0Papers((prevDrafts) =>
          prevDrafts.map((paper) =>
            paper.filename === filename ? { ...paper, draft: 1 } : paper
          )
        );
        toast.success("Paper unpublished successfully");
      }

      fetchPapers();
    } catch (error) {
      console.error("Error updating paper:", error);
    }
  };

  const allPapers = [...draft0Papers, ...draft1Papers];

  return (
    <>
      <div className={styles.researchPapersTabs}>
        <Toaster richColors position="top-right" />
        <div className={styles.tabsSidebar}>
          <div
            className={`${styles.tabLink} ${
              activeTab === "all" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Papers
          </div>
          <div
            className={`${styles.tabLink} ${
              activeTab === "published" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("published")}
          >
            Published Papers
          </div>
          <div
            className={`${styles.tabLink} ${
              activeTab === "drafts" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("drafts")}
          >
            Drafts
          </div>
        </div>
        <div className={styles.cardBody}>
          {allPapers.length === 0 ? (
            <div className={styles.noPapers}>
              <h2 className={styles.heading}>No papers you have published</h2>
              <button
                className={styles.uploadButton}
                onClick={() => navigate("/upload")}
              >
                Click to upload
              </button>
            </div>
          ) : (
            <>
              <div className={styles.filterDropdown}>
                <h2>Publications done by you</h2>
                <FilterDropdown onFilterChange={handleFilterChange} />
              </div>

              {activeTab === "all" && (
                <PaperList
                  className={styles.allPapersDiv}
                  papers={allPapers}
                  bookmarks={[]}
                  toggleBookmark={() => {}}
                  showPdf={showPdf}
                  handleCitePopup={(paper) =>
                    handleCitePopup(paper, setSelectedPaper, setShowPopup)
                  }
                  handleCopyCitation={handleCopyCitationWrapper}
                  state={""}
                  showBookmark={false}
                  showStars={false}
                />
              )}
              {activeTab === "published" && (
                <div className={styles.scrollableList}>
                  <PaperList
                    className={styles.draftPapersDiv}
                    papers={draft0Papers}
                    bookmarks={[]}
                    toggleBookmark={() => {}}
                    showPdf={showPdf}
                    handleCitePopup={(paper) =>
                      handleCitePopup(paper, setSelectedPaper, setShowPopup)
                    }
                    handleCopyCitation={handleCopyCitationWrapper}
                    state={""}
                    handleDraft={handleDraft}
                    showButtons={true}
                    showBookmark={false}
                  />
                </div>
              )}
              {activeTab === "drafts" && (
                <div className={styles.scrollableList}>
                  <PaperList
                    className={styles.draftPapersDiv}
                    papers={draft1Papers}
                    bookmarks={[]}
                    toggleBookmark={() => {}}
                    showPdf={showPdf}
                    handleCitePopup={(paper) =>
                      handleCitePopup(paper, setSelectedPaper, setShowPopup)
                    }
                    handleCopyCitation={handleCopyCitationWrapper}
                    state={""}
                    handleDelete={handleDelete}
                    handleDraft={handleDraft}
                    showButtons={true}
                    showBookmark={false}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* <div className={styles.total}>
          <div className={styles.authorheading}>
            <h2>Top Authors that might intrest you</h2>
          </div>
          {sortedProfiles.map((profile, index) => (
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
        </div> */}
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

export default AuthorHome;
