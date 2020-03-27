import React from 'react';
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  PagingInfo,
  Paging,
  Sorting,
  WithSearch
} from "@elastic/react-search-ui";
import { BooleanFacet, Layout, SingleSelectFacet, SingleLinksFacet } 
  from "@elastic/react-search-ui-views";
import getSearchConfig from './searchConfig';
import parseJsonConfig from './formatConfig';


export default class  App extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      searchConfig: undefined
    }
    this.renderSideContent = this.renderSideContent.bind(this);
    this.renderResult = this.renderResult.bind(this);
  }

  async componentDidMount() {
    const response = await fetch('./wv.json');
    const json = await response.json();
    const layerData = parseJsonConfig(json);
    this.setState({
      searchConfig: getSearchConfig(layerData)
    })
  }

  renderSideContent(wasSearched, addFilter) {
    const SORT_OPTIONS = [
      {
        name: "Title",
        value: "title",
        direction: "asc"
      }
    ];
    return (
      <div>
        {/* {wasSearched && (
          <Sorting label={"Sort by"} sortOptions={SORT_OPTIONS} />
        )} */}
        <Facet 
          field="categories"
          label="Category"
          filterType="any"
          show={20}
        />
        <Facet 
          field="measurements"
          label="Measurement"
          filterType="any"
          isFilterable={true}
          show={5}
        />
        <Facet
          field="facetPeriod"
          label="Period"
          filterType="any"
          show={10}
        />
        <Facet
          field="active"
          label="Currently Active?"
          filterType="any"
        />
        <Facet 
          field="track"
          label="Track Asc/Desc"
          filterType="any"
        />
        <Facet 
          field="daynight"
          label="Track Day/Night"
          filterType="any"
        />
        <Facet 
          field="projects"
          label="Project (From CMR)"
          filterType="any"
          isFilterable={true}
        />
        <Facet 
          field="sources"
          label="Source (From WV configs)"
          filterType="any"
          isFilterable={true}
        />
        <Facet 
          field="platforms"
          label="Platform (From CMR)"
          filterType="any"
        />
        <Facet
          field="processingLevelId"
          label="Processing Level"
          filterType="any"
          show={3}
        />
        <Facet 
          field="collectionDataType"
          label="Data Type"
          filterType="any"
        />
        <Facet
          field="dataCenter"
          label="Data Center"
          filterType="any"
          show={3}
        />
        <Facet
          field="group"
          label="Layer Group"
          filterType="any"
        />
      </div>
    )
  }

  renderResult(result) {
    if (!result) {
      return;
    }
    const { id, title, dataCenter, period, processingLevelId } = result;
    return (
      
      <li 
        key={id} 
        className="sui-result"
        onClick={() => {
          const intervals = (result.dateRanges || []).map(({dateInterval}) => dateInterval);
          console.log(result)
          console.log("Date intervals:", intervals);
        }}
      >
        <h2>{title}</h2>
        <h4>
          {dataCenter && `${dataCenter}, `}
          {period && `${period}, `}
          {processingLevelId && `${processingLevelId} `}
        </h4>
      </li>
    )
  }

  renderPagingInfo() {
    return (<PagingInfo
      view={({ totalResults }) => (
        <div className="sui-paging-info">
          <h2>
            {totalResults} total results
          </h2>
        </div>
      )}
    />);
  }

  render () {
    const { searchConfig } = this.state;  
    return !searchConfig ? null : (
      <SearchProvider config={searchConfig}>
        <WithSearch 
          mapContextToProps={
            ({ wasSearched, addFilter, results }) => ({ wasSearched, addFilter, results })
          }
        >
          {({ wasSearched, addFilter, results }) => {
            return (
              <div className="App">
                <ErrorBoundary>
                  <Layout
                    // header={<SearchBox/>}
                    sideContent={this.renderSideContent(wasSearched, addFilter)}
                    bodyContent={
                      <ul className="sui-results-container">
                        {(results || []).map(this.renderResult)}
                      </ul>
                    }
                    bodyHeader={wasSearched && this.renderPagingInfo()}
                    // bodyFooter={<Paging />}
                  />
                </ErrorBoundary>
              </div>
            );
          }}
        </WithSearch>
      </SearchProvider>
    );
  }
  
}
