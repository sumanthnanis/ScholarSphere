// import React from "react";
// import styles from "../components/Home/Home.module.css";

// const PopupComponent = ({
//   content,
//   onClose,
//   handleCopyCitation,
//   paper,
//   individualCopySuccess,
// }) => {
//   return (
//     <div className={styles.popup}>
//       <div className={styles.popupContent}>
//         <span className={styles.close} onClick={onClose}>
//           &times;
//         </span>
//         <h2 className={styles.citePaper}>Cite Paper</h2>
//         <p>{content}</p>
//         <button
//           className={styles.copyButton}
//           onClick={() => handleCopyCitation(paper)}
//         >
//           {individualCopySuccess[paper._id] ? "Cited" : "Copy Citation"}
//         </button>
//         {individualCopySuccess[paper._id] && (
//           <p className={styles.successMessage}>Copied to clipboard!</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PopupComponent;
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../components/Home/Home.module.css";

const PopupComponent = ({
  content,
  onClose,
  handleCopyCitation,
  paper,
  individualCopySuccess,
}) => {
  const dispatch = useDispatch();
  const username = useSelector((state) => state.auth.user.username); // Get username from state

  const handleCitationClick = async (paper) => {
    handleCopyCitation(paper);

    try {
      await axios.post("http://localhost:8000/api/citedby", {
        username,
        paperId: paper._id,
      });
    } catch (error) {
      console.error("Failed to save citation:", error);
    }
  };

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
          onClick={() => handleCitationClick(paper)}
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
