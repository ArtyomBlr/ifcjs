
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
}

loadIfc('./assets/file.ifc');
