const substeps = 8;

function step(x, y, {steps}) {
  const ny = steps - y;
  const yy = Math.floor(ny * substeps / steps);
  const yyy = ny % Math.floor(steps / substeps);
  const xx = Math.floor(x * substeps / steps);
  const xxx = x % Math.floor(steps / substeps);

  return (xxx % (xx + 1)) | (yyy % (yy + 1));
}