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
      jj = Math.floor(j * properties.substeps / properties.steps) * properties.substeps,
      jjj = j % Math.floor(j * properties.substeps / properties.steps),
      xfor(0, properties.steps, i => (
        ii = Math.floor(i * properties.substeps / properties.steps),
        iii = i % Math.floor(i * properties.substeps / properties.steps),
        value = (iii | jjj) % (jj + ii),
        cls = value > 0 ? "a" : "b",
        `<rect x="${i * hsize}" y="${j * vsize}" width="${hsize}" height="${vsize}" class="${cls}" />`
      ))
    ))}
</svg>
`;
  }
};