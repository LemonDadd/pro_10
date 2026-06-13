import { scriptManifest } from './scriptManifest.js';
import {
  initRegistry,
  setScriptLoaded,
  setScriptFailed,
  onAllRequiredLoaded
} from './libRegistry.js';

function loadOneScript(entry) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = entry.local;
    script.async = false;

    script.onload = () => {
      setScriptLoaded(entry.name);
      resolve({ name: entry.name, success: true, source: 'local' });
    };

    script.onerror = () => {
      if (entry.cdn) {
        const fallback = document.createElement('script');
        fallback.src = entry.cdn;
        fallback.async = false;

        fallback.onload = () => {
          setScriptLoaded(entry.name);
          resolve({ name: entry.name, success: true, source: 'cdn' });
        };

        fallback.onerror = () => {
          setScriptFailed(entry.name);
          resolve({ name: entry.name, success: false, source: null });
        };

        document.head.appendChild(fallback);
      } else {
        setScriptFailed(entry.name);
        resolve({ name: entry.name, success: false, source: null });
      }
    };

    document.head.appendChild(script);
  });
}

function buildExecutionOrder(manifest) {
  const order = [];
  const completed = new Set();
  const remaining = new Map(manifest.map(e => [e.name, e]));

  function canRun(entry) {
    if (entry.waitFor && entry.waitFor.some(w => !completed.has(w))) {
      return false;
    }
    if (entry.after && !completed.has(entry.after)) {
      return false;
    }
    return true;
  }

  while (remaining.size > 0) {
    let progress = false;
    for (const [name, entry] of remaining) {
      if (canRun(entry)) {
        order.push(entry);
        completed.add(name);
        remaining.delete(name);
        progress = true;
      }
    }
    if (!progress) {
      for (const [name, entry] of remaining) {
        order.push(entry);
        completed.add(name);
        remaining.delete(name);
      }
      break;
    }
  }

  return order;
}

export async function loadAllScripts() {
  initRegistry(scriptManifest);

  const ordered = buildExecutionOrder(scriptManifest);
  const results = [];

  let currentGroup = [];

  for (const entry of ordered) {
    const entryWaitFor = entry.waitFor || [];

    if (entry.after || entryWaitFor.length > 0) {
      if (currentGroup.length > 0) {
        const groupResults = await Promise.all(currentGroup.map(e => loadOneScript(e)));
        results.push(...groupResults);
        currentGroup = [];
      }
      const single = await loadOneScript(entry);
      results.push(single);
    } else {
      currentGroup.push(entry);
    }
  }

  if (currentGroup.length > 0) {
    const groupResults = await Promise.all(currentGroup.map(e => loadOneScript(e)));
    results.push(...groupResults);
  }

  const allLoaded = results.every(r => r.success);
  const requiredLoaded = allRequiredLoaded();
  if (!requiredLoaded) {
    for (const entry of ordered) {
      if (entry.required && !isScriptLoaded(entry.name)) {
        const global = entry.global;
        const parts = global.split('.');
        let val = window;
        let found = true;
        for (const part of parts) {
          if (val == null || val[part] == null) { found = false; break; }
          val = val[part];
        }
        if (found) {
          setScriptLoaded(entry.name);
        }
      }
    }
  }

  return new Promise((resolve) => {
    onAllRequiredLoaded(() => resolve(results));
    setTimeout(() => resolve(results), 2000);
  });
}

import { allRequiredLoaded, isScriptLoaded } from './libRegistry.js';
