import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import PaperList from "../Paper/Paper";
import BookmarksContext from "../../BookmarksContext";
import { useDispatch, useSelector } from "react-redux";

import styles from "../Home/Home.module.css";
import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleCiteThisPaper,
  handleClosePopup,
} from "../../utils/util";

const CategoryPage = () => {
  const { category } = useParams();
  const [papers, setPapers] = useState([]);
  const { bookmarkedPapers, setBookmarkedPapers } =
    useContext(BookmarksContext);
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [individualCopySuccess, setIndividualCopySuccess] = useState({});

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/get-papers?category=${category}`
        );
        setPapers(response.data);
      } catch (error) {
        console.error("Error fetching papers:", error);
      }
    };

    fetchPapers();
  }, [category]);

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

  return (
    <div>
      <div className={styles.heading}>Papers in "{category}" category</div>
      <PaperList
        papers={papers}
        bookmarks={papers.map((paper) =>
          bookmarkedPapers.some((bp) => bp._id === paper._id)
        )}
        toggleBookmark={(index, id) =>
          toggleBookmark(
            index,
            id,
            papers,
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
    </div>
  );
};

export default CategoryPage;
