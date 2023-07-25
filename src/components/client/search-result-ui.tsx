import Image from "next/image";
import React from "react";

import { SearchQuery, SearchResults } from "./search-modal";
import { BITCOINDEV, LIGHTNINGDEV } from "@/helpers/types";

type SearchResultProps = {
  searchResults: SearchResults | undefined;
  isPending: boolean;
  searchQuery: SearchQuery | null;
  showMoreResults: () => void;
  limit: number;
};

function SearchResult({
  searchResults,
  searchQuery,
  isPending,
  showMoreResults,
  limit,
}: SearchResultProps) {
  if (isPending || !searchQuery) return null;

  if (
    searchResults?.searchResults.length === 0 ||
    searchResults?.totalSearchResults === 0
  ) {
    return (
      <p className="text-center">
        Oops! we could not find what you are looking for. You can try searching
        for a similar keyword
      </p>
    );
  }

  function sortData() {
    if (!searchResults) return;
    let searchData: SearchResults["searchResults"];
    switch (searchQuery?.path) {
      case "bitcoin-dev":
        searchData = searchResults?.searchResults.filter((result) => {
          return result.link?.includes(BITCOINDEV);
        });
        break;
      case "lightning-dev":
        searchData = searchResults?.searchResults.filter((result) => {
          return result.link?.includes(LIGHTNINGDEV);
        });
        break;
      default:
        searchData = searchResults?.searchResults;
        break;
    }

    return searchData.slice(0, limit);
  }

  const showMore = searchResults && limit >= searchResults?.totalSearchResults;
  const totalSearchResultsCount = searchResults?.totalSearchResults ? `See more results (+${searchResults?.totalSearchResults - limit})` : ""

  return (
    <div className="w-full">
      <ul className="mt-0">
        {sortData()?.map((result, index) => {
          const headerText = result.link?.includes("bitcoin-dev")
            ? "bitcoin-dev"
            : "lightning-dev";
          const headerImageSrc = result.link?.includes("bitcoin-dev")
            ? "/images/btc.svg"
            : "/images/lightning-dev.svg";

          const originalAuthor = result.startedBy.split(" ").slice(0, -1).join(" ")

          return (
            <li key={`${index}-${result.link}`} className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src={headerImageSrc}
                  alt={headerText}
                  width={14}
                  height={14}
                />
                <span className="text-xs font-semibold">{headerText}</span>
              </div>
              <a
                href={result.link}
                target="_blank"
                className="hover:text-blue-600 underline text-sm capitalize"
              >
                {result.title}
              </a>
              <p className="text-sm mt-1">Started by: <span className="font-medium">{originalAuthor}</span></p>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-center gap-2 mb-1">
        <button
          className={`text-sm text-center font-semibold text-[#B06B03] hover:underline ${
            showMore && "hidden"
          }`}
          onClick={showMoreResults}
        >
          {totalSearchResultsCount}
        </button>
      </div>
    </div>
  );
}

export default SearchResult;
