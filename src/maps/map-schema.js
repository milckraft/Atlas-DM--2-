export function validateGridMap(map) {
  if (!map || typeof map !== "object") return { valid:false, errors:["El mapa debe ser un objeto."] };
  const errors = [];
  if (!Number.isInteger(map.width) || map.width < 4 || map.width > 60) errors.push("El ancho debe estar entre 4 y 60 casillas.");
  if (!Number.isInteger(map.height) || map.height < 4 || map.height > 60) errors.push("El alto debe estar entre 4 y 60 casillas.");
  if (!Array.isArray(map.tiles) || map.tiles.length !== map.height) errors.push("La cuadrícula no coincide con la altura.");
  else if (map.tiles.some(row => !Array.isArray(row) || row.length !== map.width || row.some(tile => !["wall","floor","door","water","hazard"].includes(tile)))) errors.push("La cuadrícula contiene filas o tipos de casilla inválidos.");
  return { valid:errors.length === 0, errors };
}
