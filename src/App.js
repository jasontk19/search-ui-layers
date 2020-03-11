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

/**
 * Map collection data to layer data from wv.json
 * @param {*} config 
 */
function parseJsonConfig({ layers, collections }) {
  //WARNING beware clashing keys
  return Object.keys(layers).map(layerId => {
    const { id, title, conceptId } = layers[layerId];
    return { 
      ...layers[layerId], 
      ...collections[conceptId], 
      id,
      title
    };
  });
}

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
          // isFilterable={true}
          show={15}
          addFilter={(name, value, filterType) => { 
            addFilter(name, value, filterType);
          }}
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
          show={15}
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
    const { id, title, data_center, period, processing_level_id } = result;
    return (
      <li key={id} className="sui-result">
        <h2>{title}</h2>
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
          mapContextToProps={({ wasSearched, addFilter, results }) => ({ wasSearched, addFilter, results })}>
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
