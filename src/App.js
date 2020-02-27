import React from "react";
import { config as searchConfig } from "./searchConfig";
import { processLayers } from './processLayers';
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

processLayers();

export default function App() {

  const SORT_OPTIONS = [
    {
      name: "Title",
      value: "title",
      direction: "asc"
    }
  ];

  const renderSideContent = (wasSearched) => {
    return (
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
    )
  }

  const mapContextToProps = (context) => {
    console.log('mapContextToProps', context);
    return {
      wasSearched: context.wasSearched
    }
  }

  return (
    <SearchProvider config={searchConfig}>
      <WithSearch mapContextToProps={mapContextToProps}>
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={<SearchBox/>}
                  sideContent={renderSideContent()}
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
