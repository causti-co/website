---
date: 2024-08-25
title: triangles 2
alt: triangles 2
---
```js
const substeps = 8;

function step(x, y, {steps}) {
  const yy = Math.floor(y * substeps / steps);
  const yyy = y % Math.floor(steps / substeps);
  const xx = Math.floor(x * substeps / steps);
  const xxx = x % Math.floor(steps / substeps);

  return (xxx | yyy) % (xx + yy);
}
```

[Editor Link](https://causti.co/graph/editor/#code=MYewdgzgLgBBCuAjaBTADhGBeGAOA3AFCEBm8YwUAluHFOgBQAeANDAJ5sDeqGAvgEoYXQjBihIsdu2wwAsgEMoACwB0JADYgQAJwYyAVHCS9MAejroIAomInQO02TICk8pWs3a9pmBYTI9Bg2ouLgDkxMsooq6lq6zDBGAb7+Qda2YZIwkVE4UW4xnvE+6X7GgVYhoTooUPA6YDDMkTAAPo7sQm4tMADUjiF8QA)