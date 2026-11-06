// A dedicated worker, because browsers slow page timers in hidden tabs but not these.
setInterval(() => postMessage('tick'), 1000)
