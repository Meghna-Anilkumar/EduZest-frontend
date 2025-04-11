import React, { useCallback, useEffect, useRef } from "react";

interface SearchBarProps {
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange }) => {
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const debounceDelay = 300; 

  const debouncedSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        onSearchChange(event);
      }, debounceDelay);
    },
    [onSearchChange, debounceDelay]
  );

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <div className="p-1">
      <div className="relative w-full">
        <input
          type="text"
          id="search-input"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:outline-none block w-full p-2 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search..."
          required
          onChange={debouncedSearch}
        />
      </div>
    </div>
  );
};