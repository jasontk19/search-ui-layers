import { get, set } from 'lodash';

let facets = {};
let initialFacets = {};
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
      values: ["ASIPS", "LARC"],
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

function resetFacetCounts() {
  Object.keys(facets).forEach(facetField => {
    Object.keys(facets[facetField]).forEach(filterField => {
      facets[facetField][filterField] = 0;
    })
  })
}

function getOtherFacetFilters(facetField, filters) {
  return filters.filter(filter => filter.field !== facetField);
}

function updateAllFacetCounts(currentFilters) {
  resetFacetCounts();
  console.log(facets);
  facetFields.forEach(facetField => {
    
    // Start with a filtered resultArray that has all OTHER facets applied
    const otherFilters = getOtherFacetFilters(facetField, currentFilters);
    const thisResultArray = initialLayersArray.filter(layer => {
      return otherFilters.every(({field, values}) => {
        const fieldValue = layer[field];
        const noneSelected = values.includes('None');
        const matches = values.includes(fieldValue) 
        return matches || (noneSelected && !fieldValue);
      }); 
    });


    // Get counts for each of this facet's filters 
    thisResultArray.forEach(layer => {
      const layerFieldValue = layer[facetField] || 'None';
      const currentVal = get(facets, `${facetField}.${layerFieldValue}`) || 0;
      set(facets, `${facetField}.${layerFieldValue}`, currentVal + 1);
    });

    // console.log(otherFilters);
    // console.log(thisResultArray.length);
  });
  // console.log(facets);
}

// Determine if a given layer matches any of the passed filters
function matchesFilters(layer, filters) {
  return filters.every(({field, values}) => {
    const fieldValue = layer[field];
    const noneSelected = values.includes('None');
    const matches = values.includes(fieldValue) 
    return matches || (noneSelected && !fieldValue);
  }); 
}

// Get result array based on current filters
function getResults(currentFilters) {
  // facets = {};
  updateAllFacetCounts(currentFilters);
  previousFilters = currentFilters;
  return initialLayersArray.filter(layer => matchesFilters(layer, currentFilters));
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
  initialLayersArray.forEach(layer => {
    facetFields.forEach(facetField => {
      const layerFieldValue = layer[facetField] || 'None';
      const currentVal = get(initialFacets, `${facetField}.${layerFieldValue}`) || 0;
      set(initialFacets, `${facetField}.${layerFieldValue}`, currentVal + 1);
    });
  })
  facets = initialFacets;

  return {
    // debug: true, // TODO disable for prod
    alwaysSearchOnInitialLoad: true,
    trackUrlState: false,
    initialState,
    onSearch,
    searchQuery: {}
  };
}