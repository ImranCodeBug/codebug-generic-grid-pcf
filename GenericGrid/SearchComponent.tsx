import { Input } from "@fluentui/react-components";
import * as React from "react";

interface ISearchComponentProps {
  isSearchEnabled: boolean;
  searchText: string;
  onSearchTextChange: (searchText: string) => void;
}

const SearchComponent: React.FunctionComponent<ISearchComponentProps> = ({ isSearchEnabled, searchText, onSearchTextChange }) => {
  if (!isSearchEnabled) {
    return null;
  }

  return (
    <div className="cg-grid__search">
      <Input
        className="cg-grid__search-input"
        type="text"
        placeholder="Search this view"
        aria-label="Search this view"
        value={searchText}
        onChange={(_event, data) => onSearchTextChange(data.value)}
        contentBefore={
          <svg className="cg-grid__search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.25 4.25a1 1 0 0 1-1.32 1.5l-.1-.09-4.25-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" fill="currentColor"/>
          </svg>
        }
      />
    </div>
  );
};

export default SearchComponent;
