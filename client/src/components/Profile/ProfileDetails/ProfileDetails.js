
import styles from "./ProfileDetails.module.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

const ProfileDetails = ({ authorname }) => {
 
  const [profileData, setProfileData] = useState(null);
  const [paperStats, setPaperStats] = useState({
    totalPapers: 0,
    totalCitations: 0,
    totalReads: 0,
    categories: [],
  });
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);

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

  useEffect(() => {
    const fetchUsername = authorname || data.username;
    const fetchPapersByAuthor = async () => {
      const fetchUsername = authorname || data.username;
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
    };

    if (fetchUsername) {
      fetchProfileData();
      fetchPapersByAuthor();
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
            <p>Publications: {paperStats.totalPapers}</p>
            <p> Citations: {paperStats.totalCitations}</p>
            <p> Reads: {paperStats.totalReads}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;
