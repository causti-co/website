---
date: 2024-08-25
title: stripes 1
alt: stripes 1
---
```js
const substeps = 8;

function step(x, y, {steps}) {
  const yy = Math.floor(y * substeps / steps) * substeps;
  const yyy = y % Math.floor(y * substeps / steps);
  const xx = Math.floor(x * substeps / steps);
  const xxx = x % Math.floor(x * substeps / steps);

  return (xxx | yyy) % (xx + yy);
}
```

[Editor Link](https://causti.co/graph/editor/#code=MYewdgzgLgBBCuAjaBTADhGBeGAOA3AFCEBm8YwUAluHFOgBQAeANDAJ5sDeqGAvgEoYXQjBihIsdu2wwAsgEMoACwB0JADYgQAJwYyAVHCS9MAejroIQowmT0MRMROgdpsmQFJ5StZu16hsb2VjAWpgJO4uCuTEyyiirqWrrMMLYmDuaWGJGi0ZIwcfE48d6Jfil68RkhGGE51kT5OihQ8DpgMMxxMAA+buxC3j0wANRueXxAA)