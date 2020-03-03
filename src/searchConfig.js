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
    const data = Object.keys(facetValues[field])
      .map(key => ({
        "count": facetValues[field][key],
        "value": key 
      }))
    facets[field] = [{
      "field": field,
      "type": "value",
      "data": data.sort((a, b) => b.count - a.count)
    }]
  }
  return facets;
}

// Matches results with an "AND" between filters.
function getConjunctiveResults(filters) {
  return initialLayersArray.filter(layer => {
    return filters.every(({field, values}) => {
      const fieldValue = layer[field];
      const noneSelected = values.includes('None');
      const matches = values.includes(fieldValue) 
      return matches || (noneSelected && !fieldValue);
    });
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
  const { filters } = requestState;
  const results = getConjunctiveResults(filters);

  if (firstSearch) {
    facets = formatFacets(buildInitialFacets(initialLayersArray));
    firstSearch = false;
  } else {
    const updatedFacetCounts = updateFacets(results, filters);
    facets = formatFacets(updatedFacetCounts);
  }

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