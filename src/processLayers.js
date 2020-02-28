// TODO pull from a config?
const facetFields = [ 
  'dataCenter', 
  'period', 
  'processingLevelId', 
  'group'
]
const facets = {};

export function buildInitialFacets(layers) {
  facetFields.forEach(field => {
    facets[field] = {}
  })
  layers.forEach(layer => {
    facetFields.forEach(field => {
      // TODO set 'None' value in config so filtering works
      const layerField = layer[field] || 'NONE (broken)';
      
      if (facets[field].hasOwnProperty(layerField)) {
        facets[field][layerField]++
      } else {
        facets[field][layerField] = 1;
      }
      
    })
  });

  return facets;
}

// export function updateFacets(layers) {
//   // Reset counts
//   for (const field in facets) {
//     for (const fieldVal in field) {
//       field[fieldVal] = 0;
//     }
//   }
//   layers.forEach(layer => {
//     facetFields.forEach(field => {
//       const layerFieldValue = layer[field] || 'NONE (broken)';
//       facets[field][layerFieldValue]++;
//     })
//   });
//   return facets;
// }



const mockObj = {
  dataCenter: {
    LANCEAMSR2: 3,
    NSIDC_ECS: 5
  },
  period: {
    monthly: 23,
    daily: 306
  }
}