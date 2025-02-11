import React from "react";
import { Box, Container, Typography } from "@mui/material";

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "primary.main",
        color: "white",
        py: 3,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} Reef Challenge. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};
