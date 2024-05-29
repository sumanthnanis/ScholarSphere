import React from "react";
import styles from "../components/Home/Home.module.css";

const PopupComponent = ({
  content,
  onClose,
  handleCopyCitation,
  paper,
  individualCopySuccess,
}) => {
  return (
    <div className={styles.popup}>
      <div className={styles.popupContent}>
        <span className={styles.close} onClick={onClose}>
          &times;
        </span>
        <h2 className={styles.citePaper}>Cite Paper</h2>
        <p>{content}</p>
        <button
          className={styles.copyButton}
          onClick={() => handleCopyCitation(paper)}
        >
          {individualCopySuccess[paper._id] ? "Cited" : "Copy Citation"}
        </button>
        {individualCopySuccess[paper._id] && (
          <p className={styles.successMessage}>Copied to clipboard!</p>
        )}
      </div>
    </div>
  );
};

export default PopupComponent;
