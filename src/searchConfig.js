import { get, set } from 'lodash';

let facets;
let initialLayersArray;
// TODO pull from a config?
const facetFields = [ 
  'data_center', 
  'processing_level_id',
  'period',
  'group'
]
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
  const formattedFacets = {};
  for (const field in facetValues) {
    const data = Object.keys(facetValues[field])
      .map(key => ({
        "count": facetValues[field][key],
        "value": key 
      }))
      formattedFacets[field] = [{
      "field": field,
      "type": "value",
      "data": data.sort((a, b) => b.count - a.count)
    }]
  }
  return formattedFacets;
}

function updateFacets(layer) {  
  facetFields.forEach(field => {
    const layerFieldValue = layer[field] || 'None';
    const currentVal = get(facets, `${field}.${layerFieldValue}`) || 0;
    set(facets, `${field}.${layerFieldValue}`, currentVal + 1);
  })
}

function getResults(filters) {
  let resultsArray = [];
  facets = {};
  initialLayersArray.forEach(layer => {
    let filterMatch = filters.every(({field, values}) => {
      const fieldValue = layer[field];
      const noneSelected = values.includes('None');
      const matches = values.includes(fieldValue) 
      return matches || (noneSelected && !fieldValue);
    }); 

    if (filterMatch) {
      resultsArray.push(layer);
    }
    updateFacets(layer);

  });
  return resultsArray;
}

/**
 * 
 * @param {*} requestState 
 * @param {*} queryConfig 
 * @returns {*} responseState
 */
async function onSearch(requestState, queryConfig) {
  const { filters } = requestState;
  const results = getResults(filters);
  return {
    facets: formatFacets(facets),
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