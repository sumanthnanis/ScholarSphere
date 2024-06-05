import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import styles from "./UserFiles.module.css";

import PaperList from "../../Paper/Paper";
import { toast } from "sonner";
import BookmarksContext from "../../../BookmarksContext";
import { useDispatch, useSelector } from "react-redux";

const UserFiles = () => {
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);
  const { bookmarkedPapers, setBookmarkedPapers } =
    useContext(BookmarksContext);
  const [userBookmarkedPapers, setUserBookmarkedPapers] = useState([]);
  const showPdf = async (fileName) => {
    const url = `http://localhost:8000/files/${fileName}`;

    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    }
  };

  const fetchPapers = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/get-papers`);

      setUserBookmarkedPapers(
        response.data.filter((paper) =>
          paper.bookmarkedBy.includes(data.username)
        )
      );
      console.log("bokkaosoa", userBookmarkedPapers);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };
  const handleBookmarkRemoval = async (index, id) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/toggle-bookmark`,
        {
          paperId: id,
          username: data.username,
          bookmarked: false,
        }
      );

      if (response.status === 200) {
        setUserBookmarkedPapers((prevBookmarks) =>
          prevBookmarks.filter((paper) => paper._id !== id)
        );
        toast.info("Bookmark removed successfully!");
      } else {
        console.error("Failed to remove bookmark");
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  useEffect(() => {
    if (data.username) {
      fetchPapers();
    }
  }, [data.username]);

  return (
    <div className={styles.userFiles}>
      <h2 className={styles.filesHeading}>Bookmarked by you </h2>
      <div className={styles.listBody}>
        <ul className={styles.list}>
          {userBookmarkedPapers.length === 0 ? (
            <p>No Bookmarked files found</p>
          ) : (
            <PaperList
              papers={userBookmarkedPapers}
              bookmarks={userBookmarkedPapers.map(() => true)}
              toggleBookmark={handleBookmarkRemoval}
              showPdf={showPdf}
              handleCitePopup={() => {}}
            />
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserFiles;
