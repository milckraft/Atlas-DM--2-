import { validateGridMap } from "./map-schema.js";

const COLORS = Object.freeze({ wall:"#20232b", floor:"#d8cfb8", door:"#9b6b35", water:"#6c9db5", hazard:"#b85b4b" });
export function renderMapSvg(map, { cellSize = 24 } = {}) {
  const validation=validateGridMap(map);
  if(!validation.valid) throw new TypeError(validation.errors.join(" "));
  if(!Number.isInteger(cellSize) || cellSize<8 || cellSize>64) throw new RangeError("El tamaño de casilla debe estar entre 8 y 64.");
  const width=map.width*cellSize, height=map.height*cellSize;
  const cells=map.tiles.flatMap((row,y)=>row.map((tile,x)=>`<rect x="${x*cellSize}" y="${y*cellSize}" width="${cellSize}" height="${cellSize}" fill="${COLORS[tile]}" stroke="#514b42" stroke-width="1"/>`)).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Mapa de mazmorra">${cells}</svg>`;
}
