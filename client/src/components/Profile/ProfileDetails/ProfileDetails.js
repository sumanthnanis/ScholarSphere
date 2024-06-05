// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaStar } from "react-icons/fa";
// import styles from "./ProfileDetails.module.css";
// import { useDispatch, useSelector } from "react-redux";

// const ProfileDetails = ({ authorname }) => {
//   const [profileData, setProfileData] = useState(null);
//   const [paperStats, setPaperStats] = useState({
//     totalPapers: 0,
//     totalCitations: 0,
//     totalReads: 0,
//     categories: [],
//   });
//   const [authorRatings, setAuthorRatings] = useState({
//     averageRating: 0,
//     userRating: 0,
//   });
//   const dispatch = useDispatch();
//   const data = useSelector((state) => state.auth.user);

//   const fetchProfileData = async () => {
//     const fetchUsername = authorname || data.username;
//     try {
//       const response = await fetch(
//         `http://localhost:8000/api/profile/${fetchUsername}`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setProfileData(data);
//       } else {
//         console.error("Failed to fetch profile data");
//       }
//     } catch (error) {
//       console.error("Error fetching profile data:", error);
//     }
//   };

//   const fetchAuthorRatings = async (authorName) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/get-author-ratings/${authorName}?username=${data.username}`
//       );
//       const { averageRating, userRating } = response.data;
//       setAuthorRatings({ averageRating, userRating });
//     } catch (error) {
//       console.error("Error fetching author ratings:", error);
//     }
//   };

//   const handleAuthorRatingChange = async (rating) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/rate-author",
//         {
//           authorName: authorname,
//           username: data.username,
//           rating,
//         }
//       );

//       if (response.status === 200) {
//         await fetchAuthorRatings(authorname);
//       } else {
//         console.error("Error submitting rating:", response.status);
//       }
//     } catch (error) {
//       console.error("Error submitting rating:", error);
//     }
//   };

//   const [hoverRating, setHoverRating] = useState(0);
//   const [clickedRating, setClickedRating] = useState(
//     parseInt(localStorage.getItem("clickedRating")) || authorRatings.userRating
//   );
//   const [initialRating, setInitialRating] = useState(
//     parseInt(localStorage.getItem("initialRating")) || authorRatings.userRating
//   );

//   const handleHover = (rating) => {
//     setHoverRating(rating);
//   };

//   const handleClick = (rating) => {
//     if (authorname !== data.username) {
//       // Prevent rating self
//       setClickedRating(rating);
//       setInitialRating(rating);
//       handleAuthorRatingChange(rating);
//       localStorage.setItem("clickedRating", rating);
//       localStorage.setItem("initialRating", rating);
//     }
//   };

//   const renderStars = (ratingToDisplay, isAverage = false) => {
//     if (authorname === data.username) {
//       // Only display average rating for self
//       return (
//         <span className={styles.averageRating}>
//           ({authorRatings.averageRating.toFixed(1)})
//         </span>
//       );
//     }

//     return [1, 2, 3, 4, 5].map((star) => (
//       <FaStar
//         key={star}
//         className={`${styles.star} ${
//           star <= (hoverRating || clickedRating)
//             ? isAverage
//               ? styles.averageStar
//               : star <= initialRating
//               ? styles.ratedStar
//               : ""
//             : ""
//         } ${star <= hoverRating ? styles.hovered : ""}`}
//         onMouseEnter={() => handleHover(star)}
//         onMouseLeave={() => handleHover(0)}
//         onClick={() => handleClick(star)}
//       />
//     ));
//   };

//   useEffect(() => {
//     const fetchUsername = authorname || data.username;
//     const fetchPapersByAuthor = async () => {
//       const fetchUsername = authorname || data.username;
//       try {
//         if (data?.username) {
//           const response = await axios.get(
//             `http://localhost:8000/api/get-papers?authorName=${encodeURIComponent(
//               fetchUsername
//             )}`
//           );
//           if (response.status === 200) {
//             const papers = response.data;
//             const totalPapers = papers.length;
//             const totalCitations = papers.reduce(
//               (sum, paper) => sum + paper.citations,
//               0
//             );
//             const totalReads = papers.reduce(
//               (sum, paper) => sum + paper.count,
//               0
//             );

//             const categories = [
//               ...new Set(papers.flatMap((paper) => paper.categories)),
//             ];

//             setPaperStats({
//               totalPapers,
//               totalCitations,
//               totalReads,
//               categories,
//             });
//           } else {
//             console.error("Failed to fetch papers");
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching papers:", error);
//       }
//       return () => {
//         localStorage.removeItem("clickedRating");
//         localStorage.removeItem("initialRating");
//       };
//     };

//     if (fetchUsername) {
//       fetchProfileData();
//       fetchPapersByAuthor();
//       fetchAuthorRatings(fetchUsername);
//     }
//   }, []);

//   if (!profileData) {
//     return <div>No details Found About Author</div>;
//   }

//   const isCurrentUserProfile = authorname === data.username;

//   return (
//     <div className={styles.profileDetails}>
//       <div className={styles.profileImage}>
//         <img
//           src={`http://localhost:8000${profileData.profileImage}`}
//           alt={profileData.username}
//           className={styles.profileImage}
//         />
//       </div>
//       <div className={styles.media}>
//         <div className={styles.profileMatter}>
//           <span className={styles.profilename}>{profileData.username}</span>
//           {!isCurrentUserProfile && (
//             <div className={styles.authorRating}>
//               <h4>Rating:</h4>
//               <div className={styles.stars}>{renderStars(clickedRating)}</div>
//             </div>
//           )}

//           <div className={styles.profileColleg}>
//             <ul>
//               <li className={styles.profileCollege}>
//                 Pursuing {profileData.degree} in {profileData.department} at{" "}
//                 {profileData.institution}
//               </li>
//               <li className={styles.profileCollege}>
//                 {profileData.currentActivity}
//               </li>
//             </ul>
//           </div>
//         </div>

//         {data.role === "author" && (
//           <div className={styles.paperStats}>
//             <div>Publications: {paperStats.totalPapers}</div>
//             <div> Citations: {paperStats.totalCitations}</div>
//             <div> Reads: {paperStats.totalReads}</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfileDetails;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import styles from "./ProfileDetails.module.css";
import { useDispatch, useSelector } from "react-redux";

const ProfileDetails = ({ authorname }) => {
  const [profileData, setProfileData] = useState(null);
  const [paperStats, setPaperStats] = useState({
    totalPapers: 0,
    totalCitations: 0,
    totalReads: 0,
    categories: [],
  });
  const [authorRatings, setAuthorRatings] = useState({
    averageRating: 0,
    userRating: 0,
  });
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const dispatch = useDispatch();
  const data = useSelector((state) => state.auth.user);

  const fetchProfileData = async () => {
    const fetchUsername = authorname || data.username;
    try {
      const response = await fetch(
        `http://localhost:8000/api/profile/${fetchUsername}`
      );
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        console.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const fetchAuthorRatings = async (authorName) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/get-author-ratings/${authorName}?username=${data.username}`
      );
      const { averageRating, userRating } = response.data;
      setAuthorRatings({ averageRating, userRating });
    } catch (error) {
      console.error("Error fetching author ratings:", error);
    }
  };

  const handleAuthorRatingChange = async (rating) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/rate-author",
        {
          authorName: authorname,
          username: data.username,
          rating,
        }
      );

      if (response.status === 200) {
        await fetchAuthorRatings(authorname);
      } else {
        console.error("Error submitting rating:", response.status);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const [hoverRating, setHoverRating] = useState(0);
  const [clickedRating, setClickedRating] = useState(
    parseInt(localStorage.getItem("clickedRating")) || authorRatings.userRating
  );
  const [initialRating, setInitialRating] = useState(
    parseInt(localStorage.getItem("initialRating")) || authorRatings.userRating
  );

  const handleHover = (rating) => {
    setHoverRating(rating);
  };

  const handleClick = (rating) => {
    if (authorname !== data.username) {
      setClickedRating(rating);
      setInitialRating(rating);
      handleAuthorRatingChange(rating);
      localStorage.setItem("clickedRating", rating);
      localStorage.setItem("initialRating", rating);
    }
  };

  const renderStars = (ratingToDisplay, isAverage = false) => {
    if (authorname === data.username) {
      // Only display average rating for self
      return (
        <span className={styles.averageRating}>
          ({authorRatings.averageRating.toFixed(1)})
        </span>
      );
    }

    return [1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        className={`${styles.star} ${
          star <= (hoverRating || clickedRating)
            ? isAverage
              ? styles.averageStar
              : star <= initialRating
              ? styles.ratedStar
              : ""
            : ""
        } ${star <= hoverRating ? styles.hovered : ""}`}
        onMouseEnter={() => handleHover(star)}
        onMouseLeave={() => handleHover(0)}
        onClick={() => handleClick(star)}
      />
    ));
  };

  useEffect(() => {
    const fetchUsername = authorname || data.username;
    const fetchPapersByAuthor = async () => {
      try {
        if (data?.username) {
          const response = await axios.get(
            `http://localhost:8000/api/get-papers?authorName=${encodeURIComponent(
              fetchUsername
            )}`
          );
          if (response.status === 200) {
            const papers = response.data;
            const totalPapers = papers.length;
            const totalCitations = papers.reduce(
              (sum, paper) => sum + paper.citations,
              0
            );
            const totalReads = papers.reduce(
              (sum, paper) => sum + paper.count,
              0
            );

            const categories = [
              ...new Set(papers.flatMap((paper) => paper.categories)),
            ];

            setPaperStats({
              totalPapers,
              totalCitations,
              totalReads,
              categories,
            });
          } else {
            console.error("Failed to fetch papers");
          }
        }
      } catch (error) {
        console.error("Error fetching papers:", error);
      }
      return () => {
        localStorage.removeItem("clickedRating");
        localStorage.removeItem("initialRating");
      };
    };

    if (fetchUsername) {
      fetchProfileData();
      fetchPapersByAuthor();
      fetchAuthorRatings(fetchUsername);
      setIsOwnProfile(fetchUsername === data.username);
    }
  }, []);

  if (!profileData) {
    return <div>No details Found About Author</div>;
  }

  return (
    <div className={styles.profileDetails}>
      <div className={styles.profileImage}>
        <img
          src={`http://localhost:8000${profileData.profileImage}`}
          alt={profileData.username}
          className={styles.profileImage}
        />
      </div>
      <div className={styles.media}>
        <div className={styles.profileMatter}>
          <span className={styles.profilename}>{profileData.username}</span>
          {!isOwnProfile && (
            <div className={styles.authorRating}>
              <h4>Rating:</h4>
              <div className={styles.stars}>{renderStars(clickedRating)}</div>
            </div>
          )}

          <div className={styles.profileColleg}>
            <ul>
              <li className={styles.profileCollege}>
                Pursuing {profileData.degree} in {profileData.department} at{" "}
                {profileData.institution}
              </li>
              <li className={styles.profileCollege}>
                {profileData.currentActivity}
              </li>
            </ul>
          </div>
        </div>

        {data.role === "author" && (
          <div className={styles.paperStats}>
            <div>Publications: {paperStats.totalPapers}</div>
            <div> Citations: {paperStats.totalCitations}</div>
            <div> Reads: {paperStats.totalReads}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;
