"use client";
import React from "react";
import { useUser } from "./providers/userProvider";

const NavBarAvatar = () => {
  const { user } = useUser();
  return <div>{user?.name}</div>;
};

export default NavBarAvatar;
