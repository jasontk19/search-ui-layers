import layers from './layers';
import { buildInitialFacets, updateFacets } from './processLayers';

const layersArray = Object.keys(layers).map(id => layers[id]);
let initialFacetValues = buildInitialFacets(layersArray);

const initialState = {
  filters: [
    {
      field: "dataCenter",
      values: ["ASIPS"],
      type: "any"
    }
  ]
};

function getFacets(facetValues) {
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
  return layersArray.filter(layer => {
    return filters.every(({field, values}) => values.includes(layer[field]));
  });
}

async function onSearch(requestState, queryConfig) {
  const results = getConjunctiveResults(requestState, queryConfig);
  // let facets
  // if (!initialFacetValues) {
  //   facets = initialFacetValues = buildInitialFacets(layersArray);
  // } else {
  //   facets = getFacets(updateFacets(results));
  // }
  const facets = getFacets(initialFacetValues);
  
  
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