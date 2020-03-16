import { forEach as lodashForEach } from 'lodash';

const capitalizeFirstLetter = ([first,...rest]) => {
  return first ? first.toUpperCase() + rest.join('') : '';
}
      

function setLayerProp (layer, prop, value) {
  if (layer[prop]) {
    if (!layer[prop].includes(value)) {
      layer[prop].push(value);
    }
  } else {
    layer[prop] = [value];
  }
}

function formatFacetProps({ layers, measurements, categories}) {

  // Measurements
  const measureKeys = Object.keys(measurements);
  measureKeys.forEach((measureKey) => {
    const measureObj = measurements[measureKey];
    const sourceKeys = Object.keys(measureObj.sources)
    sourceKeys.forEach((sourceKey) => {
      const { settings } = measureObj.sources[sourceKey];
      settings.forEach((id) => {
        setLayerProp(layers[id], 'measurements', measureKey);
        setLayerProp(layers[id], 'sources', sourceKey);
      });
    });
  });

  // Categories
  Object.keys(categories).forEach(categoryKey => {
    if (categoryKey === 'featured') return
    const categoryObj = categories[categoryKey];
    const subCategoryKeys = Object.keys(categoryObj);

    subCategoryKeys.forEach(subCategoryKey => {
      if (subCategoryKey === 'All') return;
      const measurementArray = categoryObj[subCategoryKey].measurements;
      measurementArray.forEach(measureKey => {
        const { sources } = measurements[measureKey];
        Object.keys(sources).forEach(sourceKey => {
          sources[sourceKey].settings.forEach(id => {
            setLayerProp(layers[id], 'categories', subCategoryKey);
          }) 
        });
      });
    });
  });


  const periodIntervalMap = {
    daily: 'Day',
    monthly: 'Month',
    yearly: 'Year'
  }

  // Layer Periods
  lodashForEach(layers, layer => {
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
    
    
  });

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
