import React, { useEffect, useState, useContext } from "react";
import PopupComponent from "../../utils/PopupComponent";
import BookmarksContext from "../../BookmarksContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import styles from "./PaperPreview.module.css";
import PaperList from "../Paper/Paper";
import { toast, Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import {
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleClosePopup,
  handleCopyCitation,
} from "../../utils/util";

const PaperPreview = () => {
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);
  const { id } = useParams();
  const [papers, setPapers] = useState([]);
  const [previewedPaper, setPreviewedPaper] = useState(null);

  const { bookmarkedPapers, setBookmarkedPapers } =
    useContext(BookmarksContext);
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [buttonText, setButtonText] = useState("Cite this paper");
  const [individualCopySuccess, setIndividualCopySuccess] = useState({});
  const [bookmarked, setBookmarked] = useState(false);

  const username = data?.username || "defaultUsername"; // Fallback username
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/get-paper/${id}`
        );
        const newPaperDetails = response.data;

        if (previewedPaper) {
          setPreviewedPaper({
            ...previewedPaper,
            ...newPaperDetails,
          });
        } else {
          setPreviewedPaper(newPaperDetails);
        }

        console.log("Response data:", response.data);
        setBookmarked(response.data.bookmarkedBy.includes(username));
      } catch (error) {
        console.error("Error fetching paper details:", error);
      }
    };

    fetchPaperDetails();
  }, [id, username]);

  useEffect(() => {
    if (previewedPaper && previewedPaper.categories) {
      fetchRelatedPapers(previewedPaper.categories);
    }
  }, [previewedPaper]);

  const fetchRelatedPapers = async (categories) => {
    try {
      if (Array.isArray(categories) && categories.length > 0) {
        const categoriesString = categories.join(",");
        const response = await axios.get(
          `http://localhost:8000/api/get-related-papers/${categoriesString}`
        );

        const filteredRelatedPapers = response.data.filter(
          (relatedPaper) => relatedPaper._id !== id
        );
        setRelatedPapers(filteredRelatedPapers);
      } else {
        console.warn("No categories found for the paper.");
        setRelatedPapers([]);
      }
    } catch (error) {
      console.error("Error fetching related papers:", error);
    }
  };

  const handleShowPdf = () => {
    showPdf(previewedPaper.pdf);
  };

  const handleCite = () => {
    handleCitePopup(previewedPaper, setSelectedPaper, setShowPopup);
    setPreviewedPaper((prevPreviewedPaper) => ({
      ...prevPreviewedPaper,
      citations: prevPreviewedPaper.citations + 1,
    }));
  };

  const handlePopupClose = () => {
    handleClosePopup(setShowPopup, setSelectedPaper);
  };

  const handleCopyCitationWrapper = async (paper) => {
    await handleCopyCitation(paper, setIndividualCopySuccess, previewedPaper);
    setPapers((prevPapers) =>
      Array.isArray(prevPapers)
        ? prevPapers.map((p) =>
            p._id === paper._id ? { ...p, citations: p.citations + 1 } : p
          )
        : []
    );
  };

  if (!previewedPaper) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Toaster richColors position="top-right" />

      <div className={styles.paperpreviewcontainer}>
        <div className={styles.paperHeading}>
          <h3 className={styles.h3}>Related Papers</h3>
          <div className={styles.paperdetails}>
            <div className={styles.uppercon}>
              <div className={styles.citationscontainer}>
                <div className={styles.papertypecon}>
                  <div className={styles.paperType}>
                    <h5 className={styles.h5} id={styles.paperType}>
                      {previewedPaper.paperType}
                    </h5>
                  </div>
                  <h5 className={styles.papertitle}>{previewedPaper.title}</h5>
                </div>
                <div className={styles.innercontainer}>
                  <div className={styles.citations}>
                    <div className={styles.divv}>Citations:</div>{" "}
                    <div>{previewedPaper.citations}</div>
                  </div>
                  <span className={styles.reads}>
                    Reads: {previewedPaper.count}
                  </span>
                </div>
              </div>

              <div className={styles.date}>
                <h5 className={styles.h5}>
                  {new Date(previewedPaper.publicationDate).toLocaleDateString(
                    undefined,
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </h5>
                <div className={styles.paperauthor}>
                  <h5 className={styles.h5}>
                    {" "}
                    Author: {previewedPaper.uploadedBy}
                  </h5>
                </div>
              </div>
            </div>
            <div className={styles.paperdescription}>
              Description
              <div className={styles.descriptionline}></div>
              {previewedPaper.description}
              <br></br>
              <button className={styles.citebutton} onClick={handleCite}>
                {buttonText}
              </button>
              <button className={styles.btnPrimary} onClick={handleShowPdf}>
                <i
                  className="fa fa-file-pdf-o"
                  aria-hidden="true"
                  id={styles.pdf}
                >
                  <span> PDF </span>
                </i>
              </button>
            </div>
          </div>
        </div>
        <div className={styles.relatedPapers}>
          <h3 className={styles.h3}>Related Papers</h3>

          <PaperList
            papers={relatedPapers}
            bookmarks={relatedPapers.map((paper) =>
              bookmarkedPapers.some((bp) => bp._id === paper._id)
            )}
            toggleBookmark={(index, id) =>
              toggleBookmark(
                index,
                id,
                relatedPapers,
                bookmarkedPapers,
                setRelatedPapers,
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

export default PaperPreview;
