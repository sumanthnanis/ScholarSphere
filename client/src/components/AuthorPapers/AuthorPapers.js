// import React, { useState, useEffect } from "react";
// import PaperList from "../Paper/Paper";
// import axios from "axios";
// import { Toaster, toast } from "sonner";
// import styles from "./AuthorPapers.module.css";
// import FilterDropdown from "../Dropdown/FilterDropdown";
// import { useDispatch, useSelector } from "react-redux";
// import { showPdf, handleCitePopup, handleCopyCitation } from "../../utils/util";
// import PopupComponent from "../../utils/PopupComponent";
// const AuthorPapers = () => {
//   const [draft0Papers, setDraft0Papers] = useState([]);
//   const [draft1Papers, setDraft1Papers] = useState([]);
//   const [activeTab, setActiveTab] = useState("all");
//   const dispatch = useDispatch();
//   const data = useSelector((prev) => prev.auth.user);
//   const [showPopup, setShowPopup] = useState(false);
//   const [selectedPaper, setSelectedPaper] = useState(null);
//   const [individualCopySuccess, setIndividualCopySuccess] = useState({});

//   const handleFilterChange = (filter) => {
//     switch (filter) {
//       case "All":
//         setActiveTab("all");
//         break;
//       case "Published Papers":
//         setActiveTab("published");
//         break;
//       case "Drafts":
//         setActiveTab("drafts");
//         break;
//       default:
//         setActiveTab("all");
//     }
//   };
//     const handlePopupClose = () => {
//       handleClosePopup(setShowPopup, setSelectedPaper);
//     };

//     const handleCopyCitationWrapper = async (paper) => {
//       await handleCopyCitation(paper, setIndividualCopySuccess, papers);
//       setPapers((prevPapers) =>
//         prevPapers.map((p) =>
//           p._id === paper._id ? { ...p, citations: p.citations + 1 } : p
//         )
//       );
//     };

//   const fetchPapers = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/papers/${data.username}`
//       );

//       const draft0 = response.data.filter((paper) => paper.draft === 0);
//       const draft1 = response.data.filter((paper) => paper.draft === 1);

//       setDraft0Papers(draft0);
//       setDraft1Papers(draft1);
//     } catch (error) {
//       console.error("Error fetching papers:", error);
//     }
//   };

//   useEffect(() => {
//     if (data.username) {
//       fetchPapers();
//     }
//   }, [data.username]);

//   const handleDelete = async (paperId) => {
//     try {
//       await axios.delete(`http://localhost:8000/api/papers/${paperId}`);

//       setDraft0Papers(draft0Papers.filter((paper) => paper._id !== paperId));
//       setDraft1Papers(draft1Papers.filter((paper) => paper._id !== paperId));
//       toast.success("Paper deleted successfully");
//     } catch (error) {
//       console.error("Error deleting paper:", error);
//       toast.error("Failed to delete paper");
//     }
//   };

//   const handleDraft = async (filename, newDraftStatus) => {
//     try {
//       await axios.put(
//         `http://localhost:8000/api/papers/${encodeURIComponent(filename)}`,
//         {
//           draft: newDraftStatus,
//         }
//       );

//       if (newDraftStatus === 0) {
//         setDraft1Papers((prevDrafts) =>
//           prevDrafts.map((paper) =>
//             paper.filename === filename ? { ...paper, draft: 0 } : paper
//           )
//         );
//         toast.success("Paper published successfully");
//       } else {
//         setDraft0Papers((prevDrafts) =>
//           prevDrafts.map((paper) =>
//             paper.filename === filename ? { ...paper, draft: 1 } : paper
//           )
//         );
//         toast.success("Paper unpublished successfully");
//       }

//       fetchPapers();
//     } catch (error) {
//       console.error("Error updating paper:", error);
//     }
//   };

//   const allPapers = [...draft0Papers, ...draft1Papers];

//   return (
//     <div>
//       <div className={styles.filterDropdown}>
//         <FilterDropdown onFilterChange={handleFilterChange} />
//       </div>
//       <div className={styles.researchPapersTabs}>
//         <Toaster richColors position="top-right" />

//         <div className={styles.tabsSidebar}>
//           <div
//             className={`${styles.tabLink} ${
//               activeTab === "all" ? styles.active : ""
//             }`}
//             onClick={() => setActiveTab("all")}
//           >
//             All Papers
//           </div>
//           <div
//             className={`${styles.tabLink} ${
//               activeTab === "published" ? styles.active : ""
//             }`}
//             onClick={() => setActiveTab("published")}
//           >
//             Published Papers
//           </div>
//           <div
//             className={`${styles.tabLink} ${
//               activeTab === "drafts" ? styles.active : ""
//             }`}
//             onClick={() => setActiveTab("drafts")}
//           >
//             Drafts
//           </div>
//         </div>
//         <div className={styles.cardBody}>
//           {activeTab === "all" && (
//             <div className={styles.scrollableList}>
//               <PaperList
//                 className={styles.allPapersDiv}
//                 papers={allPapers}
//                 bookmarks={[]}
//                 toggleBookmark={() => {}}
//                 showPdf={showPdf}
//                 handleCitePopup={(paper) =>
//                   handleCitePopup(paper, setSelectedPaper, setShowPopup)
//                 }
//                 handleCopyCitation={(paper) =>
//                   handleCopyCitation(
//                     paper,
//                     setIndividualCopySuccess,
//                     individualCopySuccess
//                   )
//                 }
//                 state={""}
//                 showBookmark={false}
//               />
//             </div>
//           )}
//           {activeTab === "published" && (
//             <div className={styles.scrollableList}>
//               <PaperList
//                 className={styles.draftPapersDiv}
//                 papers={draft0Papers}
//                 bookmarks={[]}
//                 toggleBookmark={() => {}}
//                 showPdf={showPdf}
//                 handleCitePopup={(paper) =>
//                   handleCitePopup(paper, setSelectedPaper, setShowPopup)
//                 }
//                 handleCopyCitation={(paper) =>
//                   handleCopyCitation(
//                     paper,
//                     setIndividualCopySuccess,
//                     individualCopySuccess
//                   )
//                 }
//                 state={""}
//                 handleDraft={handleDraft}
//                 showButtons={true}
//                 showBookmark={false}
//               />
//             </div>
//           )}
//           {activeTab === "drafts" && (
//             <div className={styles.scrollableList}>
//               <PaperList
//                 className={styles.draftPapersDiv}
//                 papers={draft1Papers}
//                 bookmarks={[]}
//                 toggleBookmark={() => {}}
//                 showPdf={showPdf}
//                 handleCitePopup={(paper) =>
//                   handleCitePopup(paper, setSelectedPaper, setShowPopup)
//                 }
//                 handleCopyCitation={(paper) =>
//                   handleCopyCitation(
//                     paper,
//                     setIndividualCopySuccess,
//                     individualCopySuccess
//                   )
//                 }
//                 state={""}
//                 handleDelete={handleDelete}
//                 handleDraft={handleDraft}
//                 showButtons={true}
//                 showBookmark={false}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
// {
//   showPopup && selectedPaper && (
//     <PopupComponent
//       content={`${selectedPaper.uploadedBy}. ${selectedPaper.title}`}
//       onClose={handlePopupClose}
//       handleCopyCitation={handleCopyCitationWrapper}
//       paper={selectedPaper}
//       individualCopySuccess={individualCopySuccess}
//     />
//   );
// }
// export default AuthorPapers;
import React, { useState, useEffect } from "react";
import PaperList from "../Paper/Paper";
import axios from "axios";
import { Toaster, toast } from "sonner";
import styles from "./AuthorPapers.module.css";
import FilterDropdown from "../Dropdown/FilterDropdown";
import { useDispatch, useSelector } from "react-redux";
import {
  showPdf,
  handleCitePopup,
  handleCopyCitation,
  handleClosePopup,
} from "../../utils/util";
import PopupComponent from "../../utils/PopupComponent";

const AuthorPapers = () => {
  const [draft0Papers, setDraft0Papers] = useState([]);
  const [draft1Papers, setDraft1Papers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const dispatch = useDispatch();
  const data = useSelector((state) => state.auth.user);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [individualCopySuccess, setIndividualCopySuccess] = useState({});

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

  useEffect(() => {
    if (data.username) {
      fetchPapers();
    }
  }, [data.username]);

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
    <div>
      <div className={styles.filterDropdown}>
        <FilterDropdown onFilterChange={handleFilterChange} />
      </div>
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
          {activeTab === "all" && (
            <div className={styles.scrollableList}>
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
              />
            </div>
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

export default AuthorPapers;
