import { get, set } from 'lodash';

let facets = {};
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
      values: ["ASIPS", "LARC"],
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
      "data": data //.sort((a, b) => b.count - a.count)
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

function updateFacetCounts(facetField, layer) {
  const layerFieldValue = layer[facetField] || 'None';
  const currentVal = get(facets, `${facetField}.${layerFieldValue}`) || 0;
  set(facets, `${facetField}.${layerFieldValue}`, currentVal + 1);
} 

function updateAllFacetCounts(currentFilters) {
  resetFacetCounts();
  facetFields.forEach(facetField => {
    // Start with a filtered resultArray that has all OTHER facets applied
    const otherFilters = currentFilters.filter(f => f.field !== facetField);
    layersMatchFilters(initialLayersArray, otherFilters).forEach(layer => {
      updateFacetCounts(facetField, layer);
    });
  });
}

function layersMatchFilters(layers, filters) {
  return layers.filter(layer => {
    return filters.every(({field, values}) => {
      const fieldValue = layer[field];
      const noneSelected = values.includes('None');
      const matches = values.includes(fieldValue) 
      return matches || (noneSelected && !fieldValue);
    }); 
  })
  
}

async function onSearch(requestState, queryConfig) {
  const { filters } = requestState;
  const results = layersMatchFilters(initialLayersArray, filters);
  updateAllFacetCounts(filters);
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