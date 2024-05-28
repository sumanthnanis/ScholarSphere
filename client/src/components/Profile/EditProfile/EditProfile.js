import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";
import { Toaster, toast } from "sonner";
import AuthorPapers from "../../AuthorPapers/AuthorPapers";
import UserFiles from "../UserFiles/UserFiles";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const EditProfile = ({ initialActiveTab }) => {
  const [image, setImage] = useState(null);
  const [activeTab, setActiveTab] = useState(
    initialActiveTab || "account-general"
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const data = useSelector((prev) => prev.auth.user);
  const location = useLocation();

  const [formData, setFormData] = useState({
    degree: "",
    department: "",
    interests: "",
    institution: "",
    skills: "",
    currentActivity: "",
    email: "",
    role: "",
    profileImage: "",
  });

  const [editableFields, setEditableFields] = useState({
    degree: true,
    department: true,
    interests: true,
    institution: true,
    skills: true,
    currentActivity: true,
  });

  const [isEditingImage, setIsEditingImage] = useState(false);

  const handleCancel = () => {
    navigate("/home");
  };

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    fetchProfileData();
  }, [location]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/profile/${data.username}`
      );
      if (response.ok) {
        const data = await response.json();
        setFormData(data);
      } else {
        console.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    dataToSend.append("username", data.username);
    dataToSend.append("degree", formData.degree);
    dataToSend.append("department", formData.department);
    dataToSend.append("interests", formData.interests);
    dataToSend.append("institution", formData.institution);
    dataToSend.append("skills", formData.skills);
    dataToSend.append("currentActivity", formData.currentActivity);
    if (image) {
      dataToSend.append("profileImage", image);
    }

    try {
      const response = await fetch("http://localhost:8000/api/profile", {
        method: "POST",
        body: dataToSend,
      });

      if (response.ok) {
        console.log("Profile submitted successfully");
        setIsEditingImage(false);
        fetchProfileData();
        if (activeTab === "account-general") {
          toast.success("General profile updated successfully!");
        } else if (activeTab === "account-professional") {
          toast.success("Professional profile updated successfully!");
        }
      } else {
        console.log("Failed to submit profile");
        toast.error("Failed to update changes");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      toast.error("Failed to update changes");
    }
  };

  return (
    <div>
      <Toaster richColors position="top-right" />
      <form onSubmit={handleSubmit}>
        <div className="containerr">
          <div className="card">
            <div className="row-bordered row-border-light">
              <div className="list-group-containerr">
                <div className="list-group list-group-flush account-settings-links">
                  <a
                    className={`list-group-item ${
                      activeTab === "account-general" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("account-general")}
                  >
                    General
                  </a>
                  <a
                    className={`list-group-item ${
                      activeTab === "account-professional" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("account-professional")}
                  >
                    Professional Profile
                  </a>
                  {data.role === "author" && (
                    <a
                      className={`list-group-item ${
                        activeTab === "research-papers" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("research-papers")}
                    >
                      Research papers
                    </a>
                  )}
                  <a
                    className={`list-group-item ${
                      activeTab === "my-list" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("my-list")}
                  >
                    My List
                  </a>
                </div>
                <hr className="list-group-line" />
              </div>
              <div className="content">
                <div className="tab-content">
                  <div
                    className={`tab-pane ${
                      activeTab === "account-general" ? "active" : ""
                    }`}
                    id="account-general"
                  >
                    <div className="tab-pane active">
                      <div className="card-body">
                        <div className="form-group">
                          <label htmlFor="profileImage" className="form-label">
                            Profile Image:
                          </label>
                          {formData.profileImage && !isEditingImage && (
                            <img
                              src={`http://localhost:8000${formData.profileImage}`}
                              alt="Profile"
                              className="profileImage"
                            />
                          )}
                          {isEditingImage && (
                            <input
                              type="file"
                              id="profileImage"
                              name="profileImage"
                              onChange={handleImageChange}
                            />
                          )}
                          {!isEditingImage && (
                            <button
                              type="button"
                              className="editButton"
                              onClick={() => setIsEditingImage(true)}
                            >
                              Edit Image
                            </button>
                          )}
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="username">
                            Username
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            className="form-control"
                            value={data.username}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">E-mail</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Role</label>
                          <input
                            type="text"
                            id="role"
                            name="role"
                            className="form-control"
                            value={formData.role}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`tab-pane ${
                      activeTab === "account-professional" ? "active" : ""
                    }`}
                    id="account-professional"
                  >
                    <div className="tab-pane active">
                      <div className="card-body">
                        <div className="form-group">
                          <label className="form-label">Degree</label>
                          <input
                            type="text"
                            id="degree"
                            name="degree"
                            value={formData.degree}
                            onChange={handleChange}
                            disabled={!editableFields.degree}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Department</label>
                          <input
                            type="text"
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            disabled={!editableFields.department}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Areas of Interest
                          </label>
                          <input
                            type="text"
                            id="interests"
                            name="interests"
                            value={formData.interests}
                            onChange={handleChange}
                            disabled={!editableFields.interests}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">College/Company</label>
                          <input
                            type="text"
                            id="institution"
                            name="institution"
                            value={formData.institution}
                            onChange={handleChange}
                            disabled={!editableFields.institution}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Skills and Expertise
                          </label>
                          <input
                            type="text"
                            id="skills"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            disabled={!editableFields.skills}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Current Activity</label>
                          <input
                            type="text"
                            id="currentActivity"
                            name="currentActivity"
                            value={formData.currentActivity}
                            onChange={handleChange}
                            disabled={!editableFields.currentActivity}
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {data.role === "author" && (
                    <div
                      className={`tab-pane ${
                        activeTab === "research-papers" ? "active" : ""
                      }`}
                      id="research-papers"
                    >
                      <AuthorPapers />
                    </div>
                  )}
                  <div
                    className={`tab-pane ${
                      activeTab === "my-list" ? "active" : ""
                    }`}
                    id="my-list"
                  >
                    <div className="cardBody">
                      <UserFiles />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {(activeTab === "account-general" ||
              activeTab === "account-professional") && (
              <div className="buttons">
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                &nbsp;
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        <br />
      </form>
    </div>
  );
};

export default EditProfile;
