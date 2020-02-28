import React from "react";
import { config as searchConfig } from "./searchConfig";
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  Result,
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

export default function App() {

  const renderSideContent = (wasSearched) => {
    // const SORT_OPTIONS = [
    //   {
    //     name: "Title",
    //     value: "title",
    //     direction: "asc"
    //   }
    // ];
    return (
      <div>
        {/* {wasSearched && (
          <Sorting label={"Sort by"} sortOptions={SORT_OPTIONS} />
        )} */}
        <Facet
          field="dataCenter"
          label="Data Centers"
          filterType="any"
          isFilterable={true}
        />
        <Facet
          field="period"
          label="Period"
          filterType="any"
        />
        <Facet
          field="processingLevelId"
          label="Processing Level"
          filterType="any"
        />
        <Facet
          field="group"
          label="Layer Group"
          filterType="any"
        />
      </div>
    )
  }

  return (
    <SearchProvider config={searchConfig}>
      <WithSearch 
        mapContextToProps={({ wasSearched, results }) => ({ wasSearched, results })}>
        {({ wasSearched, results }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={<SearchBox/>}
                  sideContent={renderSideContent(wasSearched)}
                  bodyContent={
                    <ul className="sui-results-container">
                      {(results || []).map((result, idx) => result.id && (
                        <li key={result.id} className="sui-result">
                          <h2>{result.title}</h2>
                          <h4>
                            {result.dataCenter},&nbsp; 
                            {result.period},&nbsp;
                            {result.processingLevelId}&nbsp;
                          </h4>
                        </li>
                      ))}
                    </ul>
                  }
                  bodyHeader={wasSearched && <PagingInfo />}
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
