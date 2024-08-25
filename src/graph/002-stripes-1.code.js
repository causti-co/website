const substeps = 8;

function step(x, y, {steps}) {
  const yy = Math.floor(y * substeps / steps) * substeps;
  const yyy = y % Math.floor(y * substeps / steps);
  const xx = Math.floor(x * substeps / steps);
  const xxx = x % Math.floor(x * substeps / steps);

  return (xxx | yyy) % (xx + yy);
}