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