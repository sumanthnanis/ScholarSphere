// AuthorList.js

import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Home.module.css";

const AuthorList = ({ profiles, searchQuery }) => {
  return (
    <div className={styles.total}>
      {profiles.length > 0 && (
        <div className={styles.headin}>
          {searchQuery
            ? `Search Results for ${searchQuery} in Authors`
            : "Top Authors"}
        </div>
      )}
      {profiles.map((profile, index) => (
        <NavLink
          key={index}
          className={styles.authorCard}
          to={`/user/${encodeURIComponent(profile.username)}`}
        >
          <div className={styles.card}>
            <div className={styles.profileContainer}>
              <div className={styles.imageContainer}>
                {profile.profileImage && (
                  <img
                    src={`http://localhost:8000${profile.profileImage}`}
                    alt={profile.username}
                    className={styles.profileImage}
                  />
                )}
              </div>
              <div className={styles.detailsOverlay}>
                <div className={styles.userInfo}>
                  <h4 className={styles.userName}>
                    {profile.username}{" "}
                    <span className={styles.statLabel}>
                      ({profile.averageRating})
                    </span>
                  </h4>
                  <p className={styles.userInstitution}>
                    {profile.institution}
                  </p>
                </div>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {profile.totalPapers}
                    </span>
                    <span className={styles.statLabel}>Publications</span>
                  </div>
                  <div className={styles.statDivider}></div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {profile.totalCitations}
                    </span>
                    <span className={styles.statLabel}>Citations</span>
                  </div>
                  <div className={styles.statDivider}></div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {profile.totalReads}
                    </span>
                    <span className={styles.statLabel}>Reads</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NavLink>
      ))}
    </div>
  );
};

export default AuthorList;
