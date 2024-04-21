function xfor(from, to, iterator) {
  let result = "";
  for (let n = from; n < to; n++) {
    result += iterator(n);
  }
  return result;
}

module.exports = {
  data: {
    date: "2024-04-20",
    title: "stripes",
    properties: {
      width: 512,
      height: 512,
      steps: 12,
      size: 0.4
    }
  },
  render({properties}) {
    const hsize = properties.width / properties.steps;
    const vsize = properties.height / properties.steps;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="RSSicon" viewBox="0 0 ${properties.width} ${properties.height}" width="${properties.width}" height="${properties.height}">
  <defs>
    <style type="text/css">
      svg {
        background: black;
        margin: calc(50vh - ${properties.height / 2 }px) auto 0;
      }
      
      polygon {stroke: darkorange; fill: none;}
    </style>
  </defs>
  ${xfor(0, properties.steps, j => (
      jj = j * vsize + vsize / 2,
      xfor(0, properties.steps, i => (
        ii = i * hsize + hsize / 2,
        c = 1.5,
        r1 = 1 + (Math.random() - 0.3) * c,
        r2 = 1 + (Math.random() - 0.3) * c,
        r3 = 1 + (Math.random() - 0.3) * c,
        r4 = 1 + (Math.random() - 0.3) * c,
        vvsize = vsize * properties.size,
        hhsize = hsize * properties.size,
        `<polygon points="${ii - r1 * hhsize / 2} ${jj - r1 * vvsize / 2} ${ii + r2 * hhsize / 2} ${jj - r2 * vvsize / 2} ${ii + r3 * hhsize / 2} ${jj + r3 * vvsize / 2} ${ii - r4 * hhsize / 2} ${jj + r4 * vvsize / 2}"/>`
      ))
    ))}
</svg>
`;
  }
};