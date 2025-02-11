import React, { ChangeEvent, memo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { SortOption } from "../model/types/SortSelector";

interface SortSelectorProps {
  sortValue: string;
  onChange: (value: string) => void;
  sortOptions: SortOption[];
  label?: string;
}

export const SortSelector: React.FC<SortSelectorProps> = memo(
  ({ sortValue, onChange, sortOptions, label = "Sort By" }) => {
    const handleChange = (e: SelectChangeEvent) => {
      onChange(e.target.value);
    };

    return (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>{label}</InputLabel>
        <Select value={sortValue} label={label} onChange={handleChange}>
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
);
