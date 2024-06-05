import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./Upload.css";
import { Toaster, toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Upload = ({ enterPage }) => {
  enterPage();
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const dispatch = useDispatch();
  const data = useSelector((state) => state.auth.user);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [paperType, setPaperType] = useState("");
  const [categories, setCategories] = useState({
    artificialIntelligence: false,
    blockchain: false,
    deepLearning: false,
    frontendDevelopment: false,
    backendDevelopment: false,
    databases: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (successMsg) {
      toast.success(successMsg);
      setSuccessMsg(null); // Clear the success message after showing the toast
    }
  }, [successMsg]);

  const onDropHandler = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    const fileName = selectedFile.name;
    const fileExtension = fileName.slice(
      ((fileName.lastIndexOf(".") - 1) >>> 0) + 2
    );

    if (fileExtension.toLowerCase() === "pdf") {
      setFile(selectedFile);
      setMsg(null);
      console.log(selectedFile);
    } else {
      setFile(null);
      setMsg("Please upload a PDF file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropHandler,
    accept: ".pdf",
  });

  const submitFile = async (e, draft) => {
    e.preventDefault();

    if (!title || !description || !paperType || !file) {
      setMsg("Please fill in all the details.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("username", data.username);
    formData.append("draft", draft);
    formData.append("paperType", paperType);
    console.log(file);

    const formattedCategories = Object.keys(categories)
      .filter((category) => categories[category])
      .map((category) => category.toLowerCase().replace(/\s+/g, ""));

    formattedCategories.forEach((category) => {
      formData.append("categories", category);
    });

    try {
      const result = await axios.post(
        "http://localhost:8000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (result.status === 200) {
        const successMessage = draft
          ? "Saved as draft successfully!"
          : "Paper uploaded successfully!";
        setSuccessMsg(successMessage);
        // setTimeout(() => {
        //   exitPage();
        //   navigate("/home");
        // }, 500);
      }
    } catch (error) {
      console.error("Error submitting file:", error);
      toast.error("Failed to upload the paper. Please try again.");
    }
  };

  const exitPage = () => {
    // exitPage();
    navigate("/home");
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="home">
        <div className="left">
          <h1 className="h1class">Add research to your profile</h1>
          <div className="titles-description">
            <input
              className="titles"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="paper-type">
            <label className="label">Paper Type:</label>
            <select
              value={paperType}
              onChange={(e) => setPaperType(e.target.value)}
              className="select-paper-type"
            >
              <option value="">Select Paper Type</option>
              <option value="conferencePaper">Conference Paper</option>
              <option value="researchProposal">Research Proposal</option>
              <option value="article">Article</option>
              <option value="presentation">Presentation</option>
            </select>
          </div>
          <div className="categories">
            <label className="label">Paper Category</label>
            <label className="label">
              <input
                type="checkbox"
                checked={categories.artificialIntelligence}
                onChange={(e) =>
                  setCategories({
                    ...categories,
                    artificialIntelligence: e.target.checked,
                  })
                }
              />
              <span> Artificial Intelligence</span>
            </label>
            <label className="label">
              <input
                type="checkbox"
                checked={categories.deepLearning}
                onChange={(e) =>
                  setCategories({
                    ...categories,
                    deepLearning: e.target.checked,
                  })
                }
              />
              <span> Deep Learning</span>
            </label>
            <label className="label">
              <input
                type="checkbox"
                checked={categories.blockchain}
                onChange={(e) =>
                  setCategories({
                    ...categories,
                    blockchain: e.target.checked,
                  })
                }
              />
              <span> Blockchain</span>
            </label>
            <label className="label">
              <input
                type="checkbox"
                checked={categories.frontendDevelopment}
                onChange={(e) =>
                  setCategories({
                    ...categories,
                    frontendDevelopment: e.target.checked,
                  })
                }
              />
              <span> Frontend Development</span>
            </label>
            <label className="label">
              <input
                type="checkbox"
                checked={categories.backendDevelopment}
                onChange={(e) =>
                  setCategories({
                    ...categories,
                    backendDevelopment: e.target.checked,
                  })
                }
              />
              <span> Backend Development</span>
            </label>
            <label className="label">
              <input
                type="checkbox"
                checked={categories.databases}
                onChange={(e) =>
                  setCategories({
                    ...categories,
                    databases: e.target.checked,
                  })
                }
              />
              <span> Databases</span>
            </label>
          </div>
          <div className="drop-area" {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <h3>Drag and Drop PDF files here</h3>
            )}
            <p>OR</p>
            <label htmlFor="file-upload" className="label">
              Select a PDF file
            </label>
            {file && (
              <div className="file-info">Uploaded File: {file.name}</div>
            )}
            <input
              id="file-upload"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf"
              style={{ display: "none" }}
            />
          </div>
          <div className="buttonss">
            {msg && <span className="spanelement">{msg}</span>}

            <button className="button" onClick={(e) => submitFile(e, 0)}>
              Upload Paper
            </button>
            <button className="button" onClick={(e) => submitFile(e, 1)}>
              Save as draft
            </button>
          </div>
          <div className="middle">
            <a onClick={exitPage} className="exitPage">
              {" "}
              <FaHome />
              Back to home
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;
