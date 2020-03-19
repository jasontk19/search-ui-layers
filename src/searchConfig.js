import { get, set } from 'lodash';

let facets = {};
let initialLayersArray;
const initialState = {
  filters: [
    // {
    //   field: "data_center",
    //   values: ["ASIPS", "LARC"],
    //   type: "any"
    // }
  ],
  resultsPerPage: Infinity
};

// TODO pull from a config?
const facetFields = [ 
  'dataCenter', 
  'processingLevelId',
  'facetPeriod',
  'group',
  'collectionDataType',
  'projects',
  'sources',
  'categories',
  'measurements',
  'platforms',
  'active',
  'track',
  'daynight'
];

function formatFacets(facetValues, firstFormat) {
  const formattedFacets = {};
  for (const field in facetValues) {
    const data = Object.keys(facetValues[field])
      .map(key => ({
        count: facetValues[field][key],
        value: key 
      }))
      .sort((a, b) => a.value.localeCompare(b.value));

    const noneIndex = data.findIndex(item => item.value === "None");
    if (noneIndex >= 0) {
      const [noneEntry] = data.splice(noneIndex, 1);
      data.splice(0,0,noneEntry);
    }

    const otherIndex = data.findIndex(item => item.value === "Other");
    if (otherIndex >= 0) {
      const [otherEntry] = data.splice(otherIndex, 1);
      data.splice(data.length,0,otherEntry);
    }

    formattedFacets[field] = [{
      field,
      type: "value",
      data
    }];
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

function updateFacetCounts(facetField, layer) {
  let fieldVal = layer[facetField] || 'None';
  fieldVal = Array.isArray(fieldVal) ? fieldVal : [fieldVal];
  fieldVal.forEach((value) => {
    const currentVal = get(facets, `['${facetField}']['${value}']`) || 0;
    set(facets, `['${facetField}']['${value}']`, currentVal + 1);
  })
} 

function updateAllFacetCounts(currentFilters) {
  resetFacetCounts();
  facetFields.forEach(facetField => {
    // Start with a filtered result array that has all OTHER facets applied
    const otherFilters = currentFilters.filter(f => f.field !== facetField);
    layersMatchFilters(initialLayersArray, otherFilters).forEach(layer => {
      updateFacetCounts(facetField, layer);
    });
  });
}

function layersMatchFilters(layers, filters) {
  return layers.filter(layer => {
    return filters.every(({field, values}) => {
      let fieldVal = layer[field];
      fieldVal = Array.isArray(fieldVal) ? fieldVal : [fieldVal];
      const noneSelected = values.includes('None');
      const matches = values.some(value => fieldVal.includes(value)); 
      return matches || (noneSelected && !fieldVal[0]);
    }); 
  })
  
}

async function onSearch(requestState, queryConfig) {
  const { filters, searchTerm } = requestState;
  const results = layersMatchFilters(initialLayersArray, filters);
  updateAllFacetCounts(filters);
  return {
    facets: formatFacets(facets),
    results,
    resultSearchTerm: '',
    totalResults: results.length
  };
}

export const getSearchConfig = (layers) => {
  initialLayersArray = layers;
  layers.forEach(layer => {
    
    facetFields.forEach(facetField => {
      updateFacetCounts(facetField, layer);
    });
  })

  return {
    // debug: true, // TODO disable for prod
    alwaysSearchOnInitialLoad: true,
    trackUrlState: false,
    initialState,
    onSearch,
    searchQuery: {}
  };
}