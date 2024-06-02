import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import BookmarksContext from "../../../BookmarksContext";
import styles from "./Search.module.css";
import PaperList from "../../Paper/Paper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleCiteThisPaper,
} from "../../../utils/util";

const SearchResults = () => {
  const { query } = useParams();
  const location = useLocation();
  const [papers, setPapers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { bookmarkedPapers, setBookmarkedPapers } =
    useContext(BookmarksContext);
  const [filters, setFilters] = useState({
    mostViewed: false,
    mostCited: false,
    mostRated: false,
  });
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [individualCopySuccess, setIndividualCopySuccess] = useState({});

  const handleFilterClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: checked,
    }));

    if (checked) {
      sortPapers(name);
    }
  };

  const sortPapers = (filterType) => {
    switch (filterType) {
      case "mostViewed":
        setPapers((prevPapers) =>
          [...prevPapers].sort((a, b) => (b.count || 0) - (a.count || 0))
        );
        break;
      case "mostCited":
        setPapers((prevPapers) =>
          [...prevPapers].sort(
            (a, b) => (b.citations || 0) - (a.citations || 0)
          )
        );
        break;
      case "mostRated":
        setPapers((prevPapers) =>
          [...prevPapers].sort(
            (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
          )
        );
        break;
      default:
        break;
    }
  };

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
      <div className={styles.filtersearch}>
        <h4 className={styles.searchresult}>Search Results for "{query}"</h4>
        <div className={styles.icon}>
          <FontAwesomeIcon icon={faFilter} onClick={handleFilterClick} />
        </div>

        {showDropdown && (
          <div className={styles.dropdown}>
            <label>
              <input
                type="checkbox"
                name="mostViewed"
                checked={filters.mostViewed}
                onChange={handleFilterChange}
              />
              Most Viewed
            </label>
            <label>
              <input
                type="checkbox"
                name="mostCited"
                checked={filters.mostCited}
                onChange={handleFilterChange}
              />
              Most Cited
            </label>
            <label>
              <input
                type="checkbox"
                name="mostRated"
                checked={filters.mostRated}
                onChange={handleFilterChange}
              />
              Most Rated
            </label>
          </div>
        )}
      </div>
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
