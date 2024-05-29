import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import PaperList from "../Paper/Paper";
import axios from "axios";
import styles from "../Home/Home.module.css";
import ProfileDetails from "../Profile/ProfileDetails/ProfileDetails";
import BookmarksContext from "../../BookmarksContext";
import { Toaster } from "sonner";
import PopupComponent from "../../utils/PopupComponent";
import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleClosePopup,
  handleCopyCitation,
} from "../../utils/util";
import { useDispatch, useSelector } from "react-redux";

const Author = () => {
  const { authorName } = useParams();
  const [papers, setPapers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const dispatch = useDispatch();
  const [individualCopySuccess, setIndividualCopySuccess] = useState({});
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

  return (
    <div className={styles.outputDiv}>
      <Toaster richColors position="top-right" />

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
        <PopupComponent
          content={`${selectedPaper.uploadedBy}. ${selectedPaper.title}`}
          onClose={handlePopupClose}
          handleCopyCitation={handleCopyCitationWrapper}
          paper={selectedPaper}
          individualCopySuccess={individualCopySuccess}
        />
      )}
    </div>
  );
};

export default Author;
