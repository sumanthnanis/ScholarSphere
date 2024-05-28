// import React, { useState, useContext } from "react";
// import { useParams } from "react-router-dom";
// import BookmarksContext from "../../../BookmarksContext";
// import PaperList from "../../Paper/Paper";
// import Home from "../../Home/Home";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   toggleBookmark,
//   showPdf,
//   handleCitePopup,
//   handleCiteThisPaper,
//   handleClosePopup,
// } from "../../../utils/util";
// import { useLocation } from "react-router-dom";
// import Navbar from "../Navbar";
// const SearchResults = () => {
//   const { query } = useParams();
//   console.log(query);
//   const [papers, setPapers] = useState([]);
//   const { bookmarkedPapers, setBookmarkedPapers } =
//     useContext(BookmarksContext);
//   const dispatch = useDispatch();
//   const data = useSelector((prev) => prev.auth.user);
//   const [showPopup, setShowPopup] = useState(false);
//   const [selectedPaper, setSelectedPaper] = useState(null);
//   const [individualCopySuccess, setIndividualCopySuccess] = useState({});

//   const handleCopyCitation = async (paper) => {
//     try {
//       await handleCiteThisPaper(
//         paper,
//         setPapers,
//         (value) => {
//           setIndividualCopySuccess((prev) => ({
//             ...prev,
//             [paper._id]: value,
//           }));
//         },
//         papers
//       );
//     } catch (error) {
//       console.error("Error copying citation:", error);
//     }
//   };
//   return (
//     <div>
//       <Navbar />
//       <h4>Search Results for "{query}"</h4>

//       <PaperList
//         searchQuery={query}
//         papers={papers}
//         bookmarks={papers.map((paper) =>
//           bookmarkedPapers.some((bp) => bp._id === paper._id)
//         )}
//         toggleBookmark={(index, id) =>
//           toggleBookmark(
//             index,
//             id,
//             papers,
//             bookmarkedPapers,
//             setPapers,
//             setBookmarkedPapers,
//             data.username
//           )
//         }
//         showPdf={showPdf}
//         handleCitePopup={(paper) =>
//           handleCitePopup(paper, setSelectedPaper, setShowPopup)
//         }
//         handleCopyCitation={handleCopyCitation}
//         individualCopySuccess={individualCopySuccess}
//       />
//     </div>
//   );
// };

// export default SearchResults;
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BookmarksContext from "../../../BookmarksContext";
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
        setPapers(response.data.papers);
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
      <h4>Search Results for "{query}"</h4>
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
