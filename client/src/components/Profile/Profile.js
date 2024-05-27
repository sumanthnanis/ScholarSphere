import EditProfile from "./EditProfile/EditProfile";
import Navbar from "../Navbar/Navbar";
import React from "react";
import ProfileDetails from "./ProfileDetails/ProfileDetails";

const Profile = () => {
  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div>
        <ProfileDetails />
      </div>
      <div>
        <EditProfile />
      </div>
    </div>
  );
};

export default Profile;
