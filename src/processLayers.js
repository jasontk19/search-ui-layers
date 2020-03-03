// TODO pull from a config?
const facetFields = [ 
  'data_center', 
  'processing_level_id',
  'period',
  'group'
]
const facets = {};
let initialLayers;
const getFieldValue = (layer, field) => {
  return layer[field] || 'None';
}

export function buildInitialFacets(layers) {
  initialLayers = layers;
  facetFields.forEach(field => { facets[field] = {} })
  initialLayers.forEach(layer => {
    facetFields.forEach(field => {
      const layerFieldValue = getFieldValue(layer, field); 
      if (facets[field].hasOwnProperty(layerFieldValue)) {
        facets[field][layerFieldValue]++
      } else {
        facets[field][layerFieldValue] = 1;
      }
    })
  });
  return facets;
}

export function updateFacets(layers) {
  // Reset counts
  for (const field in facets) {
    for (const fieldVal in facets[field]) {
      facets[field][fieldVal] = 0;
    }
  }

  layers.forEach(layer => {
    facetFields.forEach(field => {
      const layerFieldValue = getFieldValue(layer, field);
      facets[field][layerFieldValue]++;
    })
  });
  return facets;
}

/**
 * Map collection data to layer data from wv.json
 * @param {*} config 
 */
export function parseJsonConfig({ layers, collections }) {
  //WARNING beware clashing keys
  return Object.keys(layers).map(layerId => {
    const { id, title, conceptId } = layers[layerId];
    return { 
      ...layers[layerId], 
      ...collections[conceptId], 
      id,
      title
    };
  });
}
