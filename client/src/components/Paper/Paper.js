import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBookmark } from "react-icons/fa";
import styles from "../Home/Home.module.css";
import logo from "../Img/myself.jpg";

import { fetchProfiles } from "../../utils/util";

const PaperList = ({
  papers,
  bookmarks,
  toggleBookmark,
  showPdf,
  handleCitePopup,
  handleDelete,
  handleDraft,
  showButtons,
  showBookmark = true,
}) => {
  const [profiles, setProfiles] = useState([]);

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

  const getProfileImage = (username) => {
    const profile = profiles.find((profile) => profile.username === username);
    return profile ? `http://localhost:8000${profile.profileImage}` : logo;
  };

  return (
    <div>
      {papers.map(
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
                <h5 className={styles.h5}>Citations {data.citations}</h5>
                <h5 className={styles.h5}>Reads {data.count}</h5>
              </div>

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
                    // If paper is unpublished, show the unpublish button
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
