const substeps = 8;

function step(x, y, {steps}) {
  const yy = Math.floor(y * substeps / steps);
  const yyy = y % Math.floor(steps / substeps);
  const xx = Math.floor(x * substeps / steps);
  const xxx = x % Math.floor(steps / substeps);

  return (xxx | yyy) % (xx + yy);
}