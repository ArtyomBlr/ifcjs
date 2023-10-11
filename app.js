
import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes

viewer.grid.setGrid(40);
viewer.axes.setAxes(20);

async function loadIfc(url) {
  const model = await viewer.IFC.loadIfcUrl(url);

  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;

  // get spacialTree

  const spacialTree = await viewer.IFC.getSpatialStructure(model.modelID); 
  
  console.log(spacialTree);
}

loadIfc('./assets/file.ifc');

// Highlighting

container.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();
container.ondblclick = async (event) => {
  const result = await viewer.IFC.selector.pickIfcItem(event.target, false);

  if (!result) return;

  const {modelID, id} = result;

  const props = await viewer.IFC.getProperties(modelID, id, true, false);
  
  console.log(props);
};
