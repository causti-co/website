---
date: 2024-08-25
title: stripes 2
alt: stripes 2
---
```js
const substeps = 8;

function step(x, y, {steps}) {
  const ny = steps - y;
  const yy = Math.floor(ny * substeps / steps);
  const yyy = ny % Math.floor(steps / substeps);
  const xx = Math.floor(x * substeps / steps);
  const xxx = x % Math.floor(steps / substeps);

  return (xxx % (xx + 1)) | (yyy % (yy + 1));
}
```

[Editor Link](https://causti.co/graph/editor/#code=MYewdgzgLgBBCuAjaBTADhGBeGAOA3AFCEBm8YwUAluHFOgBQAeANDAJ5sDeqGAvgEoYXQjBihIsMO2x10mALQciYidA4ycAWQCGUABYA6EgBsQIAE4NpMAFRwkvTAHo5GASvHh17X7JsApDC6BsZmlgxOMK4IyPTunmqwTEyyIUam5lap9rFRMfEQHqJekjApqTipQelhWZGF0Q5x8sUlFihQ8BZgMMwpMEH9MADUMACMAkIAPn2+MkN+Y5PFfEA)