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
      overscan: 0.1,
      steps: 24,
      size: 0.5
    }
  },
  render({properties}) {
    const hsize = properties.width / properties.steps;
    const vsize = properties.height / properties.steps;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="RSSicon" viewBox="-50 -70 600 700" width="${properties.width}" height="${properties.height}">
  <defs>
    <style type="text/css">
      svg {
        background: black;
        margin: calc(50vh - ${properties.height / 2 }px) auto 0;
      }
      
      rect {stroke: darkorange; fill: none;}
    </style>
  </defs>
  ${xfor(0, properties.steps, j => (
      jj = j * vsize + vsize / 2,
      xfor(0, properties.steps, i => (
        ii = i * hsize + hsize / 2,
        f = (Math.pow(j / properties.steps, 2) + Math.pow(i / properties.steps, 2)),
        vvsize = vsize * properties.size * f,
        hhsize = hsize * properties.size * f,
        iii = ii - hhsize / 2 + 3 * j - 3 * i,
        jjj = jj - vvsize / 2 + 3 * i - 3 * j,
        `<rect x="${iii}" y="${jjj}" width="${hhsize}" height="${vvsize}" transform="rotate(${4 * j + 4 * i} ${ii} ${jj})" />`
      ))
    ))}
</svg>
`;
  }
};