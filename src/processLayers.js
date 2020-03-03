// TODO pull from a config?
const facetFields = [ 
  'data_center', 
  'processing_level_id'
]
const facets = {};

const getFieldValue = (layer, field) => {
  if (layer[field]) {
    return layer[field];
  } else if (layer['collection']) {
    return layer['collection'][field];
  }
  return 'NONE (broken)';
}

export function buildInitialFacets(layers) {
  facetFields.forEach(field => {
    facets[field] = {}
  })
  layers.forEach(layer => {
    facetFields.forEach(field => {
      // TODO set 'None' value in config so filtering works
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
  for (const layerId in layers) {
    const { conceptId } = layers[layerId];
    layers[layerId].collection = collections[conceptId]
  }
  return layers;
}
