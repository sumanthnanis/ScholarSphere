// import React, { useState, useEffect } from "react";
// import { NavLink } from "react-router-dom";
// import axios from "axios";
// import { FaBookmark, FaStar } from "react-icons/fa";
// import styles from "./paper.module.css";
// import logo from "../Img/myself.jpg";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchProfiles } from "../../utils/util";

// const PaperList = ({
//   papers,
//   bookmarks,
//   toggleBookmark,
//   searchQuery,
//   showPdf,
//   handleCitePopup,
//   handleDelete,
//   handleDraft,
//   showButtons,
//   showBookmark = true,
//   excludeCurrentUser = false,
//   showStars = true, // New prop to control star display
// }) => {
//   const [profiles, setProfiles] = useState([]);
//   const [existingRatings, setExistingRatings] = useState({});
//   const state = useSelector((prev) => prev.auth.user);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         const profileData = await fetchProfiles();
//         setProfiles(profileData || []);
//       } catch (error) {
//         console.error("Error fetching profiles:", error);
//       }
//     };

//     fetchProfileData();
//   }, []);

//   useEffect(() => {
//     const fetchRatings = async () => {
//       try {
//         const ratings = await Promise.all(
//           papers.map(async (paper) => {
//             const response = await fetch(
//               `http://localhost:8000/api/get-ratings/${paper._id}?username=${state.username}`
//             );
//             const data = await response.json();
//             return {
//               paperId: paper._id,
//               averageRating: data.averageRating,
//               userRating: data.userRating,
//             };
//           })
//         );
//         setExistingRatings(
//           Object.fromEntries(
//             ratings.map(({ paperId, averageRating, userRating }) => [
//               paperId,
//               { averageRating, userRating },
//             ])
//           )
//         );
//       } catch (error) {
//         console.error("Error fetching ratings:", error);
//       }
//     };

//     fetchRatings();
//   }, [papers, state.username]);

//   const getProfileImage = (username) => {
//     const profile = profiles.find((profile) => profile.username === username);
//     return profile ? `http://localhost:8000${profile.profileImage}` : logo;
//   };

//   const renderStars = (paperId, uploadedBy) => {
//     const isCurrentUser = uploadedBy === state.username;

//     if (!showStars) {
//       const average = existingRatings[paperId]?.averageRating ?? 0;
//       return <span>Average Rating: {average.toFixed(1)}</span>;
//     }

//     if (isCurrentUser) {
//       const average = existingRatings[paperId]?.averageRating ?? 0;
//       return <span>Average Rating: {average.toFixed(1)}</span>;
//     }

//     const { averageRating, userRating } = existingRatings[paperId] || {};
//     const userHasRated = userRating !== null;
//     const ratingToDisplay = userHasRated ? userRating : averageRating || 0;

//     return [1, 2, 3, 4, 5].map((star) => (
//       <FaStar
//         key={star}
//         className={styles.star}
//         color={userHasRated && star <= ratingToDisplay ? "gold" : "violet"}
//         onClick={() => handleRatingChange(paperId, star)}
//       />
//     ));
//   };

//   const handleRatingChange = async (paperId, rating) => {
//     try {
//       const response = await fetch("http://localhost:8000/api/rate-paper", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ paperId, username: state.username, rating }),
//       });

//       if (response.ok) {
//         const ratings = await Promise.all(
//           papers.map(async (paper) => {
//             const ratingResponse = await fetch(
//               `http://localhost:8000/api/get-ratings/${paper._id}?username=${state.username}`
//             );
//             const ratingData = await ratingResponse.json();
//             return {
//               paperId: paper._id,
//               averageRating: ratingData.averageRating,
//               userRating: ratingData.userRating,
//             };
//           })
//         );

//         setExistingRatings(
//           Object.fromEntries(
//             ratings.map(({ paperId, averageRating, userRating }) => [
//               paperId,
//               { averageRating, userRating },
//             ])
//           )
//         );
//       } else {
//         console.error("Error submitting rating:", response.status);
//       }
//     } catch (error) {
//       console.error("Error submitting rating:", error);
//     }
//   };

//   const filteredPapers = excludeCurrentUser
//     ? papers.filter((paper) => paper.uploadedBy !== state.username)
//     : papers;

//   return (
//     <div className={styles.paperrdiv}>
//       {filteredPapers.map(
//         (data, index) =>
//           data && (
//             <div
//               key={index}
//               className={`${styles.innerDiv} ${
//                 bookmarks[index] ? styles.bookmarked : ""
//               }`}
//             >
//               <div className={styles.profilepicture}>
//                 <div>
//                   <img
//                     src={getProfileImage(data.uploadedBy)}
//                     alt={data.uploadedBy}
//                     className={styles.profileImag}
//                   />
//                 </div>
//                 <div className={styles.upperpart}>
//                   <NavLink
//                     to={`/user/${encodeURIComponent(data.uploadedBy)}`}
//                     className={styles.navlnk}
//                   >
//                     <h5 className={styles.uploadedBy}>{data.uploadedBy}</h5>
//                   </NavLink>
//                   <h5 className={styles.papertype}>
//                     Added an {data.paperType}
//                   </h5>
//                 </div>
//               </div>
//               <NavLink to={`/paper/${data._id}`} className={styles.navlink}>
//                 <h3 className={styles.truncatedTitle}>{data.title}</h3>
//               </NavLink>
//               <div className={styles.details}>
//                 <h5 className={styles.h5} id={styles.paperType}>
//                   {data.paperType}
//                 </h5>
//                 {data.publicationDate && (
//                   <h5 className={styles.h5}>
//                     {new Date(data.publicationDate).toLocaleDateString(
//                       undefined,
//                       {
//                         month: "long",
//                         year: "numeric",
//                       }
//                     )}
//                   </h5>
//                 )}
//                 <h5 className={styles.h5}>Citations {data.citations}</h5>
//                 <h5 className={styles.h5}>Reads {data.count}</h5>
//               </div>

//               <div className={styles.stars}>
//                 <div className={styles.pbc}>
//                   <button
//                     className={styles.btnPrimary}
//                     onClick={() => showPdf(data.pdf)}
//                   >
//                     <i
//                       className="fa fa-file-pdf-o"
//                       aria-hidden="true"
//                       id={styles.pdf}
//                     >
//                       <span> PDF </span>
//                     </i>
//                   </button>
//                   {showBookmark && (
//                     <button
//                       className={`${styles.btnBookmark} ${
//                         bookmarks[index] ? styles.bookmarked : ""
//                       }`}
//                       onClick={() => toggleBookmark(index, data._id)}
//                     >
//                       <FaBookmark />
//                       <span className={styles.tooltip}>Bookmark</span>
//                     </button>
//                   )}
//                   <button
//                     className={styles.citeButton}
//                     onClick={() => handleCitePopup(data)}
//                   >
//                     <i className="fa fa-quote-right" aria-hidden="true"></i>
//                     <span className={styles.tooltip}>Cite</span>
//                   </button>
//                 </div>
//                 <div className={styles.rating}>
//                   {renderStars(data._id, data.uploadedBy)}
//                   {showStars && (
//                     <span className={styles.averageRating}>
//                       (
//                       {(existingRatings[data._id]?.averageRating ?? 0).toFixed(
//                         1
//                       )}
//                       )
//                     </span>
//                   )}
//                 </div>
//               </div>
//               <div className={styles.rateauthor}>
//                 <NavLink to={`/user/${encodeURIComponent(data.uploadedBy)}`}>
//                   Rate this author?
//                 </NavLink>
//               </div>
//               {showButtons && (
//                 <div className={styles.listButtons}>
//                   {data.draft ? (
//                     <div>
//                       <button
//                         onClick={() => handleDelete(data._id)}
//                         className={`${styles.deleteButton} ${styles.draftButton}`}
//                       >
//                         Delete
//                       </button>
//                       <button
//                         onClick={() => handleDraft(data.pdf, 0)}
//                         className={`${styles.publishButton} ${styles.draftButton}`}
//                       >
//                         Publish
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() => handleDraft(data.pdf, 1)}
//                       className={styles.unpublishButton}
//                     >
//                       Unpublish
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           )
//       )}
//     </div>
//   );
// };

// export default PaperList;
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { FaBookmark, FaStar } from "react-icons/fa";
import styles from "./paper.module.css";
import logo from "../Img/myself.jpg";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfiles } from "../../utils/util";

const PaperList = ({
  papers,
  bookmarks,
  toggleBookmark,
  searchQuery,
  showPdf,
  handleCitePopup,
  handleDelete,
  handleDraft,
  showButtons,
  showBookmark = true,
  excludeCurrentUser = false,
  showStars = true, // New prop to control star display
}) => {
  const [profiles, setProfiles] = useState([]);
  const [existingRatings, setExistingRatings] = useState({});
  const [citationUsers, setCitationUsers] = useState({});
  const state = useSelector((prev) => prev.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await fetchProfiles();
        setProfiles(profileData || []);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const ratings = await Promise.all(
          papers.map(async (paper) => {
            const response = await fetch(
              `http://localhost:8000/api/get-ratings/${paper._id}?username=${state.username}`
            );
            const data = await response.json();
            return {
              paperId: paper._id,
              averageRating: data.averageRating,
              userRating: data.userRating,
            };
          })
        );
        setExistingRatings(
          Object.fromEntries(
            ratings.map(({ paperId, averageRating, userRating }) => [
              paperId,
              { averageRating, userRating },
            ])
          )
        );
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchRatings();
  }, [papers, state.username]);

  const getProfileImage = (username) => {
    const profile = profiles.find((profile) => profile.username === username);
    return profile ? `http://localhost:8000${profile.profileImage}` : logo;
  };

  const renderStars = (paperId, uploadedBy) => {
    const isCurrentUser = uploadedBy === state.username;

    if (!showStars) {
      const average = existingRatings[paperId]?.averageRating ?? 0;
      return <span>Average Rating: {average.toFixed(1)}</span>;
    }

    if (isCurrentUser) {
      const average = existingRatings[paperId]?.averageRating ?? 0;
      return <span>Average Rating: {average.toFixed(1)}</span>;
    }

    const { averageRating, userRating } = existingRatings[paperId] || {};
    const userHasRated = userRating !== null;
    const ratingToDisplay = userHasRated ? userRating : averageRating || 0;

    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={styles.star}
        color={userHasRated && star <= ratingToDisplay ? "gold" : "violet"}
        onClick={() => handleRatingChange(paperId, star)}
      />
    ));
  };

  const handleRatingChange = async (paperId, rating) => {
    try {
      const response = await fetch("http://localhost:8000/api/rate-paper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paperId, username: state.username, rating }),
      });

      if (response.ok) {
        const ratings = await Promise.all(
          papers.map(async (paper) => {
            const ratingResponse = await fetch(
              `http://localhost:8000/api/get-ratings/${paper._id}?username=${state.username}`
            );
            const ratingData = await ratingResponse.json();
            return {
              paperId: paper._id,
              averageRating: ratingData.averageRating,
              userRating: ratingData.userRating,
            };
          })
        );

        setExistingRatings(
          Object.fromEntries(
            ratings.map(({ paperId, averageRating, userRating }) => [
              paperId,
              { averageRating, userRating },
            ])
          )
        );
      } else {
        console.error("Error submitting rating:", response.status);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const fetchCitationUsers = async (paperId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/citedby/${paperId}`
      );
      console.log("citationsssssssssssss by", response.data);
      setCitationUsers((prev) => ({
        ...prev,
        [paperId]: response.data.citedby,
      }));
    } catch (error) {
      console.error("Error fetching citation users:", error);
    }
  };

  const handleMouseEnter = (paperId) => {
    if (!citationUsers[paperId]) {
      fetchCitationUsers(paperId);
    }
  };

  const filteredPapers = excludeCurrentUser
    ? papers.filter((paper) => paper.uploadedBy !== state.username)
    : papers;

  return (
    <div className={styles.paperrdiv}>
      {filteredPapers.map(
        (data, index) =>
          data && (
            <div
              key={index}
              className={`${styles.innerDiv} ${
                bookmarks[index] ? styles.bookmarked : ""
              }`}
            >
              <div className={styles.profilepicture}>
                <div>
                  <img
                    src={getProfileImage(data.uploadedBy)}
                    alt={data.uploadedBy}
                    className={styles.profileImag}
                  />
                </div>
                <div className={styles.upperpart}>
                  <NavLink
                    to={`/user/${encodeURIComponent(data.uploadedBy)}`}
                    className={styles.navlnk}
                  >
                    <h5 className={styles.uploadedBy}>{data.uploadedBy}</h5>
                  </NavLink>
                  <h5 className={styles.papertype}>
                    Added an {data.paperType}
                  </h5>
                </div>
              </div>
              <NavLink to={`/paper/${data._id}`} className={styles.navlink}>
                <h3 className={styles.truncatedTitle}>{data.title}</h3>
              </NavLink>
              <div className={styles.details}>
                <h5 className={styles.h5} id={styles.paperType}>
                  {data.paperType}
                </h5>
                {data.publicationDate && (
                  <h5 className={styles.h5}>
                    {new Date(data.publicationDate).toLocaleDateString(
                      undefined,
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </h5>
                )}
                <h5
                  className={styles.h5}
                  onMouseEnter={() => handleMouseEnter(data._id)}
                >
                  Citations {data.citations}
                  <div className={styles.citedbynames}>
                    {citationUsers[data._id]
                      ? citationUsers[data._id].join(", ")
                      : "Loading..."}
                  </div>
                </h5>
                <h5 className={styles.h5}>Reads {data.count}</h5>
              </div>

              <div className={styles.stars}>
                <div className={styles.pbc}>
                  <button
                    className={styles.btnPrimary}
                    onClick={() => showPdf(data.pdf)}
                  >
                    <i
                      className="fa fa-file-pdf-o"
                      aria-hidden="true"
                      id={styles.pdf}
                    >
                      <span> PDF </span>
                    </i>
                  </button>
                  {showBookmark && (
                    <button
                      className={`${styles.btnBookmark} ${
                        bookmarks[index] ? styles.bookmarked : ""
                      }`}
                      onClick={() => toggleBookmark(index, data._id)}
                    >
                      <FaBookmark />
                      <span className={styles.tooltip}>Bookmark</span>
                    </button>
                  )}
                  <button
                    className={styles.citeButton}
                    onClick={() => handleCitePopup(data)}
                  >
                    <i className="fa fa-quote-right" aria-hidden="true"></i>
                    <span className={styles.tooltip}>Cite</span>
                  </button>
                </div>
                <div className={styles.rating}>
                  {renderStars(data._id, data.uploadedBy)}
                  {showStars && (
                    <span className={styles.averageRating}>
                      (
                      {(existingRatings[data._id]?.averageRating ?? 0).toFixed(
                        1
                      )}
                      )
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.rateauthor}>
                <NavLink to={`/user/${encodeURIComponent(data.uploadedBy)}`}>
                  Rate this author?
                </NavLink>
              </div>
              {showButtons && (
                <div className={styles.listButtons}>
                  {data.draft ? (
                    <div>
                      <button
                        onClick={() => handleDelete(data._id)}
                        className={`${styles.deleteButton} ${styles.draftButton}`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleDraft(data.pdf, 0)}
                        className={`${styles.publishButton} ${styles.draftButton}`}
                      >
                        Publish
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDraft(data.pdf, 1)}
                      className={styles.unpublishButton}
                    >
                      Unpublish
                    </button>
                  )}
                </div>
              )}
            </div>
          )
      )}
    </div>
  );
};

export default PaperList;
