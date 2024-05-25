// utils.js
import axios from "axios";
import { toast } from "sonner";

export const toggleBookmark = async (
  index,

  paperId,
  papers,
  bookmarkedPapers,
  setPapers,
  setBookmarkedPapers,
  username
) => {
  try {
    const paperArray = Array.isArray(papers) ? papers : [papers]; // Ensure papers is an array
    const paper = paperArray[index];
    const bookmarked = !bookmarkedPapers.some((bp) => bp._id === paper._id);

    const response = await axios.post(
      `http://localhost:8000/api/toggle-bookmark`,
      {
        paperId: paperId, // Use the paperId parameter
        username: username,
        bookmarked,
      }
    );

    if (response.status === 200) {
      const updatedPaper = response.data.paper;

      const updatedPapers = Array.isArray(papers)
        ? // If papers is an array, map over it and update the relevant paper
          papers.map((p) => (p._id === updatedPaper._id ? updatedPaper : p))
        : // If papers is a single paper, return the updated paper directly
          updatedPaper;

      setPapers(updatedPapers);

      if (bookmarked) {
        setBookmarkedPapers((prev) => [...prev, updatedPaper]);
        toast.success("Bookmarked successfully!");
      } else {
        setBookmarkedPapers((prev) =>
          prev.filter((p) => p._id !== updatedPaper._id)
        );
        toast.info("Bookmark removed successfully!");
      }
    } else {
      console.error("Failed to update bookmark status");
    }
  } catch (error) {
    console.error("Error updating bookmark status:", error);
  }
};

export const showPdf = async (fileName) => {
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

export const handleCitePopup = (paper, setSelectedPaper, setShowPopup) => {
  setSelectedPaper(paper);
  setShowPopup(true);
};
export const handleClosePopup = (setShowPopup, setSelectedPaper) => {
  setShowPopup(false);
  setSelectedPaper(null);
};

export const fetchProfiles = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/profile");
    const profilesData = response.data;
    const profilesArray = Array.isArray(profilesData)
      ? profilesData
      : [profilesData];

    console.log("these are profiles", profilesArray);
    return profilesArray;
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
};

export const handleCiteThisPaper = async (
  selectedPaper,
  setPapers,
  setCopySuccess,
  papers
) => {
  if (!selectedPaper) return;

  try {
    await axios.post(
      `http://localhost:8000/api/increase-citations/${selectedPaper._id}`
    );

    if (Array.isArray(papers)) {
      // If papers is an array (as in the Home component)
      setPapers((prevPapers) =>
        prevPapers.map((paper) =>
          paper._id === selectedPaper._id
            ? { ...paper, citations: paper.citations + 1 }
            : paper
        )
      );
    } else {
      // If papers is an object (as in the PaperPreview component)
      setPapers((prevPaper) => ({
        ...prevPaper,
        citations: prevPaper.citations + 1,
      }));
    }
    const citationText = `Title: ${selectedPaper.title}, Author: ${selectedPaper.uploadedBy}`;
    await navigator.clipboard.writeText(citationText);
    console.log("Citation copied to clipboard:", citationText);
    setCopySuccess(true);
  } catch (error) {
    console.error("Error citing paper:", error);
  }
};

export const fetchPapers = async (setPapers) => {
  try {
    console.log("dgdgddh");
    let url = "http://localhost:8000/api/get-papers";
    const params = new URLSearchParams();

    const response = await axios.get(url);
    const papersData = response.data;

    setPapers(papersData);
  } catch (error) {
    console.error("Error fetching papers:", error);
  }
};
// apiUtils.js
