import { get, set } from 'lodash';

let facets = {};
let initialLayersArray;

// TODO pull from a config?
const facetFields = [ 
  'data_center', 
  'processing_level_id',
  'period',
  'group',
  'collection_data_type',
  'platforms_formatted',
  'instruments_formatted'
];

const initialState = {
  filters: [
    {
      field: "data_center",
      values: ["ASIPS", "LARC"],
      type: "any"
    }
  ]
};

function formatPlatformInstrument(layer) {
  layer.platforms_formatted = [];
  layer.instruments_formatted = [];
  (layer.Platforms || []).forEach(({ShortName, Instruments}) => {
    layer.platforms_formatted.push(ShortName);
    let instrumentName;
    (Instruments || []).forEach(instrument => {
      instrumentName = instrument["ShortName"];
      layer.instruments_formatted.push(instrumentName);
    });
  });
  delete layer['Platforms'];
};

function formatFacets(facetValues, firstFormat) {
  const formattedFacets = {};
  for (const field in facetValues) {
    const data = Object.keys(facetValues[field])
      .map(key => ({
        "count": facetValues[field][key],
        "value": key 
      }));
    formattedFacets[field] = [{
      "field": field,
      "type": "value",
      "data": data //.sort((a, b) => b.count - a.count)
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
    const currentVal = get(facets, `${facetField}.${value}`) || 0;
    set(facets, `${facetField}.${value}`, currentVal + 1);
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
      return matches || (noneSelected && !fieldVal);
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

export const getSearchConfig = (layers) => {
  initialLayersArray = layers;
  layers.forEach(layer => {

    formatPlatformInstrument(layer);

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