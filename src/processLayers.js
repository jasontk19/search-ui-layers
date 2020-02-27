import layers from './layers';

export function processLayers() {
  const dataCenters = {};

  for (const layerId in layers) {
    const layer = layers[layerId];
    dataCenters[layer.dataCenter] = !dataCenters[layer.dataCenter] 
      ? 0 
      : dataCenters[layer.dataCenter]++;
  };

}

