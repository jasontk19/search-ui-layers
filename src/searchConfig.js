import { buildInitialFacets, updateFacets } from './processLayers';

let initialLayersArray;
let firstSearch = true;

const initialState = {
  filters: [
    {
      field: "data_center",
      values: ["ASIPS"],
      type: "any"
    }
  ]
};

function formatFacets(facetValues) {
  const facets = {};
  for (const field in facetValues) {
    facets[field] = [{
      "field": field,
      "type": "value",
      "data":Object.keys(facetValues[field])
        .map(key => ({
          "count": facetValues[field][key],
          "value": key 
        })).sort((a, b) => b.count - a.count)
    }]
  }
  return facets;
}

// Matches results with an "AND" between filters.
function getConjunctiveResults(requestState, queryConfig) {
  const { filters } = requestState;
  return initialLayersArray.filter(layer => {
    return filters.every(({field, values}) => values.includes(layer[field]));
  });
}

/**
 * 
 * @param {*} requestState 
 * @param {*} queryConfig 
 * @returns {*} responseState
 */
async function onSearch(requestState, queryConfig) {
  let facets;
  const results = getConjunctiveResults(requestState, queryConfig);
  
  facets = formatFacets(buildInitialFacets(initialLayersArray));
  
  // if (firstSearch) {
  //   firstSearch = false;
  //   facets = formatFacets(buildInitialFacets(initialLayersArray));
  // } else {
  //   // TODO - the solution is somewhere between these two functions.
  //   // We want to keep each facet name but update the counts

  //   // const updatedFacetCounts = updateFacets(results);
  //   const updatedFacetCounts = buildInitialFacets(results);
  //   facets = formatFacets(updatedFacetCounts);
  // }

  return {
    facets,
    results,
    resultSearchTerm: '',
    totalResults: results.length
  };
}


export const getSearchConfig = (layerData) => {
  initialLayersArray = Object.keys(layerData).map(id => layerData[id]);

  return {
    debug: true, // TODO disable for prod
    alwaysSearchOnInitialLoad: true,
    trackUrlState: false,
    initialState,
    onSearch
  };
}