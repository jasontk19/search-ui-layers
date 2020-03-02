import layers from './layers';
import { buildInitialFacets, updateFacets } from './processLayers';

const initialLayersArray = Object.keys(layers).map(id => layers[id]);
let firstSearch = true;

const initialState = {
  filters: [
    {
      field: "dataCenter",
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

async function onSearch(requestState, queryConfig) {
  let facets;
  const results = getConjunctiveResults(requestState, queryConfig);
  
  if (firstSearch) {
    firstSearch = false;
    facets = formatFacets(buildInitialFacets(initialLayersArray));
  } else {
    // TODO - the solution is somewhere between these two functions.
    // We want to keep each facet name but update the counts

    // const updatedFacetCounts = updateFacets(results);
    const updatedFacetCounts = buildInitialFacets(results);
    facets = formatFacets(updatedFacetCounts);
  }

  const responseState = {
    facets,
    results,
    resultSearchTerm: '',
    totalResults: results.length
  }
  return responseState;
}
export const config = {
  debug: true, // TODO disable for prod
  alwaysSearchOnInitialLoad: true,
  trackUrlState: false,
  initialState,
  onSearch
};