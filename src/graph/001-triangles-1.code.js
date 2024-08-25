const substeps = 4;

function step(x, y, {steps}) {
  const yy = Math.floor(y * substeps / steps) * substeps;
  const xx = Math.floor(x * substeps / steps);

  return (x | y) % (xx + yy);
}