import { get, set } from 'lodash';

let facets;
let initialLayersArray;
let previousFilters;
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

function getFilterDiff(currFilters=[], prevFilters=[]) {
  const findDiff = (filters1, filters2) => {
    let diff;
    filters1.forEach(filter => {
      let matchingFilter2 = filters2.find(({ field }) => field === filter.field);
      const f2Values = matchingFilter2 ? matchingFilter2.values : [];
      const { values: f1Values } = filter; 
      const diffValue = f2Values
        .filter(x => !f1Values.includes(x))
        .concat(f1Values.filter(x => !f2Values.includes(x)));
  
      if (diffValue.length) {
        diff = { 
          field: filter.field,
          value: diffValue[0]
        }
      }
    });
    return diff;
  }
  const prevCount = prevFilters && prevFilters.length;
  const currCount = currFilters && currFilters.length;

  if (prevCount >= currCount) {
    return findDiff(prevFilters, currFilters);
  } else if (currCount) {
    return findDiff(currFilters, prevFilters);
  }
}

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

// Update counts for each facet filter
function updateFacets(layer, filterDiff) {  
  facetFields.forEach(field => {
    const layerFieldValue = layer[field] || 'None';
    const currentVal = get(facets, `${field}.${layerFieldValue}`) || 0;
    set(facets, `${field}.${layerFieldValue}`, currentVal + 1);
  })
}

// Determine if a given layers matches any of the enabled filters
function matchesFilters(layer, filters) {
  return filters.every(({field, values}) => {
    const fieldValue = layer[field];
    const noneSelected = values.includes('None');
    const matches = values.includes(fieldValue) 
    return matches || (noneSelected && !fieldValue);
  }); 
}

function getResults(currentFilters) {
  let resultsArray = [];
  let filterDiff = getFilterDiff(currentFilters, previousFilters);
  facets = {};
  console.log(filterDiff);

  initialLayersArray.forEach(layer => {
    if (matchesFilters(layer, currentFilters)) {
      resultsArray.push(layer);
    }
    updateFacets(layer, filterDiff);
  });

  previousFilters = currentFilters;
  return resultsArray;
}

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
    // debug: true, // TODO disable for prod
    alwaysSearchOnInitialLoad: true,
    trackUrlState: false,
    initialState,
    onSearch,
    searchQuery: {}
  };
}