import React from "react";

const RightSideBar = () => {
  return (
    <section className="custom-scrollbar rightsidebar">
      <div className="flex flex-col flex-1 justify-start">
        <h3 className=" text-light-1 text-heading4-medium">
          Suggested Communities
        </h3>
      </div>

      <div className="flex flex-col flex-1 justify-start">
        <h3 className=" text-light-1 text-heading4-medium">Suggested Users</h3>
      </div>
    </section>
  );
};

export default RightSideBar;
