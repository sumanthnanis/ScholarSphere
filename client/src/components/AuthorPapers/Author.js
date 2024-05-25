import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import PaperList from "../Paper/Paper";
import axios from "axios";
import styles from "../Home/Home.module.css";
import ProfileDetails from "../Profile/ProfileDetails/ProfileDetails";
import BookmarksContext from "../../BookmarksContext";
import { Toaster } from "sonner";
import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleClosePopup,
  handleCiteThisPaper,
} from "../../utils/util";
import { useDispatch, useSelector } from "react-redux";

const Author = () => {
  const { authorName } = useParams();
  const [papers, setPapers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);
  const { bookmarkedPapers, setBookmarkedPapers } =
    useContext(BookmarksContext);

  useEffect(() => {
    const fetchPapersByAuthor = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/get-papers?authorName=${encodeURIComponent(
            authorName
          )}`
        );
        const papersData = response.data;
        setPapers(papersData);
      } catch (error) {
        console.error("Error fetching papers:", error);
      }
    };

    fetchPapersByAuthor();
  }, [authorName]);

  return (
    <div className={styles.outputDiv}>
      <Toaster richColors position="top-right" />
      <Navbar hideCategoriesFilter={true} />
      <ProfileDetails authorname={authorName} />
      <PaperList
        papers={papers}
        bookmarks={papers.map((paper) =>
          bookmarkedPapers.some((bp) => bp._id === paper._id)
        )}
        toggleBookmark={(index, id) =>
          toggleBookmark(
            index,
            id, // Pass the paperId instead of index
            papers,
            bookmarkedPapers,
            setPapers, // Update the relevant state
            setBookmarkedPapers,
            data.username
          )
        }
        showPdf={showPdf}
        handleCitePopup={(paper) =>
          handleCitePopup(paper, setSelectedPaper, setShowPopup)
        }
      />
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
  );
};

export default Author;
