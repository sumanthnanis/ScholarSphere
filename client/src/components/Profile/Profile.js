import EditProfile from "./EditProfile/EditProfile";

import React from "react";
import ProfileDetails from "./ProfileDetails/ProfileDetails";

const Profile = () => {
  return (
    <div>
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
