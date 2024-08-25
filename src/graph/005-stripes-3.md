---
date: 2024-08-25
title: stripes 3
alt: stripes 3
---
```js
const substeps = 8;

function step(x, y, {steps}) {
  const ny = steps - y;
  const yy = Math.floor(ny * substeps / steps);
  const yyy = ny % Math.floor(steps / substeps);
  const nx = steps - x;
  const xx = Math.floor(nx * substeps / steps);
  const xxx = nx % Math.floor(steps / substeps);

  return (xxx % (xx + 1)) ^ (yyy % (yy + 1));
}
```

[Editor Link](https://causti.co/graph/editor/#code=MYewdgzgLgBBCuAjaBTADhGBeGAOA3AFCEBm8YwUAluHFOgBQAeANDAJ5sDeqGAvgEoYXQjBihIsMO2x10mALQciYidA4ycAWQCGUABYA6EgBsQIAE4NpMAFRwkvTAHo5GASvHh17X7JsApDC6BsZmlgxOMK4IyPTunmpSTLJRSkyJ3rBMKdp6RqbmVmAp9rFRMfEQHqJekjA5uTAlMEEhBeFWFQ5x8jW1FihQ8BZgMMw5reOTANQwAIwCQgB6474yQQx+c4s1fEA)