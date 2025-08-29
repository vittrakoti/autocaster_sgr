// electron/services/obs.service.js
import { getClient, isConnected } from "../connection/obs.connect.js";

function assertConnected() {
  if (!isConnected()) throw new Error("Not connected to OBS");
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getSceneCollections() {
  assertConnected();
  const obs = getClient();
  const { sceneCollections, currentSceneCollectionName } = await obs.call(
    "GetSceneCollectionList"
  );
  const names = (sceneCollections || []).map((s) =>
    typeof s === "string" ? s : s?.sceneCollectionName ?? s?.name ?? String(s)
  );
  return { sceneCollections: names, currentSceneCollectionName };
}

export async function getScenesAndSourcesForCurrentCollection() {
  assertConnected();
  const obs = getClient();
  const { scenes, currentProgramSceneName } = await obs.call("GetSceneList");
  const details = [];
  for (const { sceneName } of scenes) {
    const { sceneItems } = await obs.call("GetSceneItemList", { sceneName });
    details.push({ sceneName, sources: sceneItems.map((i) => i.sourceName) });
  }
  return { currentProgramSceneName, scenes: details };
}

export async function getScenesAndSourcesForCollection(
  sceneCollectionName,
  { peek = true, pauseMs = 250 } = {}
) {
  assertConnected();
  if (!sceneCollectionName) throw new Error("sceneCollectionName is required");
  const obs = getClient();
  const { currentSceneCollectionName } = await obs.call(
    "GetSceneCollectionList"
  );
  const needSwitch = currentSceneCollectionName !== sceneCollectionName;

  try {
    if (needSwitch) {
      await obs.call("SetCurrentSceneCollection", { sceneCollectionName });
      await sleep(pauseMs);
    }
    const { scenes, currentProgramSceneName } = await obs.call("GetSceneList");
    const details = [];
    for (const { sceneName } of scenes) {
      const { sceneItems } = await obs.call("GetSceneItemList", { sceneName });
      details.push({ sceneName, sources: sceneItems.map((i) => i.sourceName) });
    }
    return {
      sceneCollectionName,
      currentProgramSceneName,
      scenes: details,
      switched: needSwitch && !peek,
      peeked: needSwitch && peek,
    };
  } finally {
    if (peek && needSwitch && currentSceneCollectionName) {
      await obs.call("SetCurrentSceneCollection", {
        sceneCollectionName: currentSceneCollectionName,
      });
    }
  }
}

export async function setSceneCollection(name) {
  assertConnected();
  return getClient().call("SetCurrentSceneCollection", {
    sceneCollectionName: name,
  });
}
export async function getScenes() {
  assertConnected();
  return getClient().call("GetSceneList");
}
export async function switchScene(sceneName) {
  assertConnected();
  return getClient().call("SetCurrentProgramScene", { sceneName });
}
export async function startStreaming() {
  assertConnected();
  return getClient().call("StartStream");
}
export async function stopStreaming() {
  assertConnected();
  return getClient().call("StopStream");
}
export async function getStatus() {
  assertConnected();
  return getClient().call("GetStreamStatus");
}
