import { validateGridMap } from "./map-schema.js";

function makeRandom(seed) {
  let state = (Number(seed) >>> 0) || 1;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
}

export function generateStarterDungeon({ seed = 1, width = 24, height = 16 } = {}) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 12 || height < 10 || width > 60 || height > 60) {
    throw new RangeError("El mapa debe medir al menos 12x10 y como máximo 60x60.");
  }
  const random = makeRandom(seed);
  const tiles = Array.from({ length:height }, () => Array(width).fill("wall"));
  const rooms = [];
  const roomCount = 4;
  for (let i=0;i<roomCount;i++) {
    const roomWidth = 3 + Math.floor(random()*4);
    const roomHeight = 3 + Math.floor(random()*3);
    const x = 1 + Math.floor(random()*(width-roomWidth-2));
    const y = 1 + Math.floor(random()*(height-roomHeight-2));
    const room = { x,y,width:roomWidth,height:roomHeight,cx:Math.floor(x+roomWidth/2),cy:Math.floor(y+roomHeight/2) };
    rooms.push(room);
    for(let row=y;row<y+roomHeight;row++) for(let col=x;col<x+roomWidth;col++) tiles[row][col]="floor";
  }
  rooms.sort((a,b)=>a.cx-b.cx);
  for(let i=1;i<rooms.length;i++) {
    const a=rooms[i-1],b=rooms[i];
    for(let x=Math.min(a.cx,b.cx);x<=Math.max(a.cx,b.cx);x++) tiles[a.cy][x]="floor";
    for(let y=Math.min(a.cy,b.cy);y<=Math.max(a.cy,b.cy);y++) tiles[y][b.cx]="floor";
  }
  const doors=[];
  for(let y=1;y<height-1;y++) for(let x=1;x<width-1;x++) {
    if(tiles[y][x]==="floor" && random()<0.025) { tiles[y][x]="door"; doors.push({x,y}); }
  }
  const map={ width,height,tiles,rooms:rooms.map(({x,y,width,height})=>({x,y,width,height})),doors,seed:String(seed),formatVersion:1 };
  const validation=validateGridMap(map);
  if(!validation.valid) throw new Error(validation.errors.join(" "));
  return map;
}
