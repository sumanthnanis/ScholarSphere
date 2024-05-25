import React, { useEffect, useState, useContext } from "react";
import Navbar from "../Navbar/Navbar";
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
  handleCiteThisPaper,
} from "../../utils/util";

const PaperPreview = () => {
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);
  const { id } = useParams();
  const [papers, setPapers] = useState([]);
  const { bookmarkedPapers, setBookmarkedPapers } =
    useContext(BookmarksContext);
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [buttonText, setButtonText] = useState("Cite this paper");
  const [copySuccess, setCopySuccess] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const username = data?.username || "defaultUsername"; // Fallback username
  const [selectedPaper, setSelectedPaper] = useState(null);

  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/get-paper/${id}`
        );
        setPapers(response.data);
        setBookmarked(response.data.bookmarkedBy.includes(username));
      } catch (error) {
        console.error("Error fetching paper details:", error);
      }
    };

    fetchPaperDetails();
  }, [id, username]);

  useEffect(() => {
    if (papers) {
      fetchRelatedPapers(papers.categories);
    }
  }, [papers]);

  const fetchRelatedPapers = async (categories) => {
    try {
      const categoriesString = categories.join(",");
      const response = await axios.get(
        `http://localhost:8000/api/get-related-papers/${categoriesString}`
      );

      const filteredRelatedPapers = response.data.filter(
        (relatedPaper) => relatedPaper._id !== id
      );
      setRelatedPapers(filteredRelatedPapers);
    } catch (error) {
      console.error("Error fetching related papers:", error);
    }
  };

  const handleShowPdf = () => {
    showPdf(papers.pdf);
  };

  const handleCite = () => {
    handleCitePopup(papers, setSelectedPaper, setShowPopup);
  };

  const handleClose = () => {
    handleClosePopup(setShowPopup, setSelectedPaper);
  };

  const handleCitePaper = () => {
    handleCiteThisPaper(selectedPaper, setPapers, setCopySuccess);
  };

  if (!papers) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Toaster richColors position="top-right" />

      <Navbar hideCategoriesFilter={true} />
      <div className={styles.paperpreviewcontainer}>
        <div className={styles.paperdetails}>
          <div className={styles.uppercon}>
            <div className={styles.citationscontainer}>
              <div className={styles.papertypecon}>
                <div className={styles.paperType}>
                  <h5 className={styles.h5} id={styles.paperType}>
                    {papers.paperType}
                  </h5>
                </div>
                <h5 className={styles.papertitle}>{papers.title}</h5>
              </div>
              <div className={styles.innercontainer}>
                <div className={styles.citations}>
                  <div className={styles.divv}>Citations:</div>{" "}
                  <div>{papers.citations}</div>
                </div>
                <span className={styles.reads}>Reads: {papers.count}</span>
              </div>
            </div>

            <div className={styles.date}>
              <h5 className={styles.h5}>
                {new Date(papers.publicationDate).toLocaleDateString(
                  undefined,
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h5>
              <div className={styles.paperauthor}>
                <h5 className={styles.h5}> Author: {papers.uploadedBy}</h5>
              </div>
            </div>
          </div>
          <div className={styles.paperdescription}>
            Description
            <div className={styles.descriptionline}></div>
            {papers.description}
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

                id, // Pass the paperId
                relatedPapers,
                bookmarkedPapers,
                setRelatedPapers, // Update the relevant state
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
        <div className={styles.popup}>
          <div className={styles.popupcontent}>
            <span className={styles.close} onClick={handleClose}>
              &times;
            </span>
            <h2 className={styles.citepaper}>Cite Paper</h2>
            <p>
              {selectedPaper.uploadedBy}. {selectedPaper.title}
            </p>
            <button className={styles.copybutton} onClick={handleCitePaper}>
              {buttonText}
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

export default PaperPreview;
