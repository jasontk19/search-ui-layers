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
import { getSearchConfig } from './searchConfig';
import { parseJsonConfig } from './processLayers'

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

  renderSideContent(wasSearched) {
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
          field="data_center"
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
          field="processing_level_id"
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

  renderResult(result) {
    if (!result) {
      return;
    }
    const { data_center, processing_level_id } = result.collection;
    const { period } = result;
    return (
      <li key={result.id} className="sui-result">
        <h2>{result.title}</h2>
        <h4>
          {data_center},&nbsp; 
          {period},&nbsp;
          {processing_level_id}&nbsp;
        </h4>
      </li>
    )
  }

  render () {
    const { searchConfig } = this.state;  
    return !searchConfig ? null : (
      <SearchProvider config={searchConfig}>
        <WithSearch 
          mapContextToProps={({ wasSearched, results }) => ({ wasSearched, results })}>
          {({ wasSearched, results }) => {
            return (
              <div className="App">
                <ErrorBoundary>
                  <Layout
                    header={<SearchBox/>}
                    sideContent={this.renderSideContent(wasSearched)}
                    bodyContent={
                      <ul className="sui-results-container">
                        {(results || []).map(this.renderResult)}
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
  
}
