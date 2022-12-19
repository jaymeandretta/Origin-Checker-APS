/// import * as Autodesk from "@types/forge-viewer";

async function getAccessToken(callback) {
  try {
    const resp = await fetch("/api/auth/token");
    if (!resp.ok) {
      throw new Error(await resp.text());
    }
    const { access_token, expires_in } = await resp.json();
    callback(access_token, expires_in);
  } catch (err) {
    alert("Could not obtain access token. See the console for more details.");
    console.error(err);
  }
}

export function initViewer(container) {
  return new Promise(function (resolve, reject) {
    Autodesk.Viewing.Initializer({ getAccessToken }, async function () {
      const viewer = new Autodesk.Viewing.GuiViewer3D(container, { extensions: ['OriginCheckExtension', 'Autodesk.DataVisualization'] });
      viewer.start();
      viewer.setTheme("light-theme");
      resolve(viewer);
    });
  });
}

export function loadModel(viewer, urn, projectId) {
  function onDocumentLoadSuccess(doc) {
    viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
    doc.downloadAecModelData();
    loadCoordinates(viewer, urn, projectId);
  }
  function onDocumentLoadFailure(code, message) {
    alert("Could not load model. See console for more details.");
    console.error(message);
  }
  Autodesk.Viewing.Document.load(
    "urn:" + urn,
    onDocumentLoadSuccess,
    onDocumentLoadFailure
  );
}

async function loadCoordinates(viewer, urn, projectId) {
  //This function retrieves the coordinates from the JSON in the bucket
  //Hardcoded for testing
  let mockUpJSON = { "basePoint": "(0.000000000, 0.000000000, 0.000000000)", "surveyPoint": "(0.000000000, 0.000000000, 0.000000000)", "trueNorthAngle": 0.0, "correctProjectBasePoint": "(20.523000000, 10.267000000, 50.503000000)", "correctSurveyPoint": "(10.492000000, 15.043000000, 8.494000000)" };
  let resp = await (await fetch(`/api/hubs/projects/${projectId}/versions/${atob(urn)}`)).json();
  let modelDataJSON = await fetch(`/api/hubs/models?model_name=${resp.modelName}`);
  let coordinatesObject = {
    modelBasePoint: {
      x: parseFloat(mockUpJSON.basePoint.replaceAll(/\(|\)/g, '').split(',')[0]),
      y: parseFloat(mockUpJSON.basePoint.replaceAll(/\(|\)/g, '').split(',')[1]),
      z: parseFloat(mockUpJSON.basePoint.replaceAll(/\(|\)/g, '').split(',')[2])
    },
    modelSurveyPoint: {
      x: parseFloat(mockUpJSON.surveyPoint.replaceAll(/\(|\)/g, '').split(',')[0]),
      y: parseFloat(mockUpJSON.surveyPoint.replaceAll(/\(|\)/g, '').split(',')[1]),
      z: parseFloat(mockUpJSON.surveyPoint.replaceAll(/\(|\)/g, '').split(',')[2])
    },
    correctBasePoint: {
      x: parseFloat(mockUpJSON.correctProjectBasePoint.replaceAll(/\(|\)/g, '').split(',')[0]),
      y: parseFloat(mockUpJSON.correctProjectBasePoint.replaceAll(/\(|\)/g, '').split(',')[1]),
      z: parseFloat(mockUpJSON.correctProjectBasePoint.replaceAll(/\(|\)/g, '').split(',')[2])
    },
    correctSurveyPoint: {
      x: parseFloat(mockUpJSON.correctSurveyPoint.replaceAll(/\(|\)/g, '').split(',')[0]),
      y: parseFloat(mockUpJSON.correctSurveyPoint.replaceAll(/\(|\)/g, '').split(',')[1]),
      z: parseFloat(mockUpJSON.correctSurveyPoint.replaceAll(/\(|\)/g, '').split(',')[2])
    }
  }
  viewer.getExtension('OriginCheckExtension').coordinates = coordinatesObject;
}