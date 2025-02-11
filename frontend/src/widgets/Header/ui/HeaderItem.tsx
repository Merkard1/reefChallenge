import React, { memo } from "react";
import { getUser } from "@/entities/User";
import { Button } from "@mui/material";
import { HeaderItemType } from "../model/types/Header";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  item: HeaderItemType;
}

export const HeaderItem = memo(({ item }: SidebarItemProps) => {
  const isAuth = getUser;

  if (item.authOnly && !isAuth) {
    return null;
  }

  return (
    <Button color="inherit" component={Link} to={item.path}>
      {item.text}
    </Button>
  );
});
