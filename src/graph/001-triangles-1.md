---
date: 2024-08-25
title: triangles 1
alt: triangles 1
---
```js
const substeps = 4;

function step(x, y, {steps}) {
  const yy = Math.floor(y * substeps / steps) * substeps;
  const xx = Math.floor(x * substeps / steps);

  return (x | y) % (xx + yy);
}
```

[Editor Link](https://causti.co/graph/editor/#code=MYewdgzgLgBBCuAjaBTADhGBeGAWA3AFCEBm8YwUAluHFOgBQAeANDAJ5sDeqGAvgEoYXQjBihIsdu2wwAsgEMoACwB0JADYgQAJwYyAVHCS9MAejroIQowmT0MRMROgwmTWYpXqtu5jFsTB3NLDAEiURgdFCh4HTAYfwAfDiEAUkT3GABqDnZwwj4gA)