"use client";
import React from "react";
import { useUser } from "./providers/userProvider";

type Props = {};

const navbarAvatar = (props: Props) => {
  const { user } = useUser();
  return <div>{user?.name}</div>;
};

export default navbarAvatar;
