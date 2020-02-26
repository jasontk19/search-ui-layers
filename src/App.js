import React from "react";
import { config as searchConfig } from "./searchConfig";

import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting,
  WithSearch
} from "@elastic/react-search-ui";
import {
  BooleanFacet,
  Layout,
  SingleSelectFacet,
  SingleLinksFacet
} from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

const SORT_OPTIONS = [
  {
    name: "Relevance",
    value: "",
    direction: ""
  },
  {
    name: "Title",
    value: "title",
    direction: "asc"
  }
];

export default function App() {
  return (
    <SearchProvider config={searchConfig}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={
                    <SearchBox
                      autocompleteMinimumCharacters={3}
                      autocompleteResults={{
                        linkTarget: "_blank",
                        sectionTitle: "Results",
                        titleField: "title",
                        urlField: "nps_link",
                        shouldTrackClickThrough: true,
                        clickThroughTags: ["test"]
                      }}
                      autocompleteSuggestions={true}
                      debounceLength={0}
                    />
                  }
                  sideContent={
                    <div>
                      {wasSearched && (
                        <Sorting label={"Sort by"} sortOptions={SORT_OPTIONS} />
                      )}
                      <Facet
                        field="states"
                        label="States"
                        filterType="any"
                        isFilterable={true}
                      />
                      <Facet
                        field="world_heritage_site"
                        label="World Heritage Site?"
                        view={BooleanFacet}
                      />
                      <Facet
                        field="visitors"
                        label="Visitors"
                        view={SingleLinksFacet}
                      />
                      <Facet
                        field="date_established"
                        label="Date Established"
                        filterType="any"
                      />
                      <Facet
                        field="location"
                        label="Distance"
                        filterType="any"
                      />
                      <Facet
                        field="acres"
                        label="Acres"
                        view={SingleSelectFacet}
                      />
                    </div>
                  }
                  bodyContent={
                    <Results
                      titleField="title"
                      urlField="nps_link"
                      shouldTrackClickThrough={true}
                    />
                  }
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          );
        }}
      </WithSearch>
    </SearchProvider>
  );
}
