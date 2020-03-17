import { forEach as lodashForEach } from 'lodash';

const periodIntervalMap = {
  daily: 'Day',
  monthly: 'Month',
  yearly: 'Year'
}

function capitalizeFirstLetter ([first, ...rest]) {
  return first ? first.toUpperCase() + rest.join('') : '';
}
      
function setLayerProp (layer, prop, value) {
  if (value && value.includes('Featured')) {
    return;
  }
  if (layer[prop] && !layer[prop].includes(value)) {
    layer[prop].push(value);
  } else if (value) {
    layer[prop] = [value];
  }
}

function getMeasurementSourceFacetProps (layers, measurements) {
  lodashForEach(measurements, (measureObj, measureKey) => {
    lodashForEach(measureObj.sources, ({ settings }, sourceKey) => {
      settings.forEach((id) => {
        setLayerProp(layers[id], 'measurements', measureKey);
        setLayerProp(layers[id], 'sources', sourceKey);
      });
    })
  });
}

function getCategoryFacetProps (layers, measurements, categories) {
  lodashForEach(categories, (categoryObj, categoryKey) => {
    if (categoryKey === 'featured') {
      return
    }
    lodashForEach(categoryObj, (subCategoryObj, subCategoryKey) => {
      if (subCategoryKey === 'All') {
        return;
      }
      subCategoryObj.measurements.forEach(measureKey => {
        const { sources } = measurements[measureKey];
        lodashForEach(sources, ({settings}) => {
          settings.forEach(id => {
            setLayerProp(layers[id], 'categories', subCategoryKey);
          }) 
        });
      });
    });
  });  
}

function getLayerPeriodFacetProps(layer) {
  const { period, dateRanges } = layer;
  if (!dateRanges) {
    layer.facetPeriod = period;
    return;
  }
  const dateIntervals = (dateRanges || []).map(({dateInterval}) => dateInterval);
  const firstInterval = Number.parseInt(dateIntervals[0], 10);
  const consistentIntervals = dateIntervals.every(interval => {
    const parsedInterval = Number.parseInt(interval, 10);
    return parsedInterval === firstInterval;
  });

  layer.facetPeriod = period;
  if (period === "subdaily" || firstInterval === 1) {
    return
  }

  if (consistentIntervals && firstInterval <= 16) {
    layer.facetPeriod = `${firstInterval}-${periodIntervalMap[period]}`;
  } else {
    layer.facetPeriod = `Multi-${periodIntervalMap[period]}`;
  }
}

function getActiveInactiveFacetProps(layer) {
  layer.active = layer.inactive ? "No" : "Yes";
}

function getOrbitTrackRelatedFacetProps(layer, allLayers) {
  (layer.tracks || []).forEach(orbitTrackId => {
    const {track, daynight} = allLayers[orbitTrackId] || {};
    setLayerProp(layer, 'track', track);
    setLayerProp(layer, 'daynight', daynight);
  });
}

function formatFacetProps({ layers, measurements, categories}) {
  getMeasurementSourceFacetProps(layers, measurements);
  getCategoryFacetProps(layers, measurements, categories);
  lodashForEach(layers, (layer) => {
    getLayerPeriodFacetProps(layer);
    getActiveInactiveFacetProps(layer);
    getOrbitTrackRelatedFacetProps(layer, layers);
  })
  return layers;
}


/**
 * Map collection data to layer data from wv.json
 * @param {*} config 
 */
export function parseJsonConfig(config) {
  const { collections } = config;
  const layers = formatFacetProps(config);
  
  return Object.keys(layers).map(layerId => {
    //WARNING beware clashing keys
    const { id, title, conceptId } = layers[layerId];
    return { 
      ...layers[layerId], 
      ...collections[conceptId], 
      id,
      title
    };
  });
}
