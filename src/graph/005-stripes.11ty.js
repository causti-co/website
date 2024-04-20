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
      width: 640,
      height: 640,
      steps: 256,
      substeps: 8
    }
  },
  render({properties}) {
    const hsize = properties.width / properties.steps;
    const vsize = properties.height / properties.steps;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="RSSicon" viewBox="0 0 ${properties.width} ${ properties.height}" width="${properties.width}" height="${properties.height}">
  <defs>
    <style type="text/css">
      svg {
        background: black;
        margin: calc(50vh - ${properties.height / 2 }px) auto 0;
      }
      
      .a {stroke: none; fill: black;}
      .b {stroke: none; fill: darkorange;}
    </style>
  </defs>
  ${xfor(0, properties.steps, j => (
      nj = properties.steps - j,
      jj = Math.floor(j * properties.substeps / properties.steps),
      jjj = j % Math.floor(properties.steps / properties.substeps),
      xfor(0, properties.steps, i => (
        ni = properties.steps - i,
        ii = Math.floor(i * properties.substeps / properties.steps),
        iii = i % Math.floor(properties.steps / properties.substeps),
        value = (iii % (ii + 1)) ^ (jjj % (jj + 1)),
        cls = value > 0 ? "a" : "b",
        `<rect x="${ni * hsize}" y="${nj * vsize}" width="${hsize}" height="${vsize}" class="${cls}" />`
      ))
    ))}
</svg>
`;
  }
};