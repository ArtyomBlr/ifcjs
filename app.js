
import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCDOOR,
  IFCWINDOW,
  IFCFURNISHINGELEMENT,
  IFCMEMBER,
  IFCPLATE
} from 'web-ifc';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
const scene = viewer.context.getScene();

// Create grid and axes

viewer.grid.setGrid(40);
viewer.axes.setAxes(20);

// List of categories names
const categories = {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCFURNISHINGELEMENT,
  IFCDOOR,
  IFCWINDOW,
  IFCPLATE,
  IFCMEMBER
};

async function setUpMultiThreading() {
  const manager = viewer.IFC.loader.ifcManager;

  await manager.useWebWorkers(true, './IFCWorker.js');
}

setUpMultiThreading();

async function loadIfc(url) {
  const model = await viewer.IFC.loadIfcUrl(url);

  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;
  
  model.removeFromParent();

  await setupAllCategories();
}

loadIfc('./assets/file.ifc');

// Highlighting

container.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();
container.ondblclick = async (event) => {
  const result = await viewer.IFC.selector.pickIfcItem(event.target, false);

  if (!result) return;

  const {modelID, id} = result;

  const props = await viewer.IFC.getProperties(modelID, id, true, false);
};

// Gets the name of a category

function getName(category) {
  const names = Object.keys(categories);
  
  return names.find((name) => categories[name] === category);
}

// Gets the IDs of all the items of a specific category
async function getAll(category) {
  return viewer.IFC.loader.ifcManager.getAllItemsOfType(0, category, false);
}

// Creates a new subset containing all elements of a category
async function newSubsetOfType(category) {
  const ids = await getAll(category);

  return viewer.IFC.loader.ifcManager.createSubset({
      modelID: 0,
      scene,
      ids,
      removePrevious: true,
      customID: category.toString()
  })
}

// Stores the created subsets
const subsets = {};

async function setupAllCategories() {
	const allCategories = Object.values(categories);

	for (let i = 0; i < allCategories.length; i++) {
		const category = allCategories[i];
		await setupCategory(category);
	}
}

// Creates a new subset and configures the checkbox
async function setupCategory(category) {
  subsets[category] = await newSubsetOfType(category);
	setupCheckBox(category);
}

// Sets up the checkbox event to hide / show elements
function setupCheckBox(category) {
  const name = getName(category);
  const checkBox = document.getElementById(name);
  checkBox.addEventListener('change', (event) => {
      const checked = event.target.checked;
      const subset = subsets[category];
      if (checked) scene.add(subset);
      else subset.removeFromParent();
  });
}

function setupProgressNotification() {
  const text = document.getElementById('progress-text');
  viewer.IFC.loader.ifcManager.setOnProgress((event) => {
    const percent = event.loaded / event.total * 100;
      const result = Math.trunc(percent);
      text.innerText = result.toString();
  });
}

setupProgressNotification();
