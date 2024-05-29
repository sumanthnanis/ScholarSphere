import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookmarksContext from "../../../BookmarksContext";
import styles from "./Search.module.css";
import PaperList from "../../Paper/Paper";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleCiteThisPaper,
  handleClosePopup,
} from "../../../utils/util";
import Navbar from "../Navbar";

const SearchResults = () => {
  const { query } = useParams();
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
          `http://localhost:8000/api/search?search=${query}`
        );
        const paperIds = new Set();
        const uniquePapers = response.data.papers.filter((paper) => {
          if (paperIds.has(paper._id)) {
            return false;
          }
          paperIds.add(paper._id);
          return true;
        });
        setPapers(uniquePapers);
      } catch (error) {
        console.error("Error fetching papers:", error);
      }
    };

    fetchPapers();
  }, [query]);

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
      <h4 className={styles.searchresult}>Search Results for "{query}"</h4>
      <PaperList
        searchQuery={query}
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
    </div>
  );
};

export default SearchResults;
