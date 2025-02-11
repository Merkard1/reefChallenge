import React, { ChangeEvent, memo } from "react";
import { TextField, Box } from "@mui/material";

interface SearchBarProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = memo(
  ({ value, onChange, placeholder }) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder || "Search..."}
          value={value}
          onChange={handleChange}
        />
      </Box>
    );
  }
);
