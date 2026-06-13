const Registry = new Map();

let callbacks = [];

export function initRegistry(manifest) {
  Registry.clear();
  callbacks = [];
  for (const item of manifest) {
    Registry.set(item.name, {
      status: 'pending',
      global: item.global,
      required: !!item.required
    });
  }
}

export function setScriptLoaded(name) {
  const entry = Registry.get(name);
  if (!entry) return;
  entry.status = 'loaded';
  checkAndFireCallbacks();
}

export function setScriptFailed(name) {
  const entry = Registry.get(name);
  if (!entry) return;
  entry.status = 'failed';
}

export function isScriptLoaded(name) {
  const entry = Registry.get(name);
  return entry ? entry.status === 'loaded' : false;
}

export function isScriptRequired(name) {
  const entry = Registry.get(name);
  return entry ? !!entry.required : false;
}

export function getRequiredScripts() {
  const result = [];
  for (const [name, entry] of Registry) {
    if (entry.required) {
      result.push(name);
    }
  }
  return result;
}

export function getOptionalScripts() {
  const result = [];
  for (const [name, entry] of Registry) {
    if (!entry.required) {
      result.push(name);
    }
  }
  return result;
}

export function allRequiredLoaded() {
  for (const [, entry] of Registry) {
    if (entry.required && entry.status !== 'loaded') {
      return false;
    }
  }
  return true;
}

export function getLoadedCount() {
  let count = 0;
  for (const [, entry] of Registry) {
    if (entry.status === 'loaded') {
      count++;
    }
  }
  return count;
}

export function getMissingRequired() {
  const result = [];
  for (const [name, entry] of Registry) {
    if (entry.required && entry.status !== 'loaded') {
      result.push(name);
    }
  }
  return result;
}

export function onAllRequiredLoaded(callback) {
  if (allRequiredLoaded()) {
    callback();
    return;
  }
  callbacks.push(callback);
}

function checkAndFireCallbacks() {
  if (!allRequiredLoaded()) return;
  const toFire = callbacks.slice();
  callbacks = [];
  for (const cb of toFire) {
    cb();
  }
}
