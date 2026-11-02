import test from "node:test";
import assert from "node:assert/strict";
import { generateStarterDungeon } from "../src/maps/dungeon-generator.js";
import { renderMapSvg } from "../src/maps/render-map-svg.js";
import { validateGridMap } from "../src/maps/map-schema.js";

test("genera mapas válidos",()=>assert.equal(validateGridMap(generateStarterDungeon({seed:42})).valid,true));
test("la misma semilla produce el mismo mapa",()=>assert.deepEqual(generateStarterDungeon({seed:123}),generateStarterDungeon({seed:123})));
test("semillas diferentes pueden producir mapas diferentes",()=>assert.notDeepEqual(generateStarterDungeon({seed:1}),generateStarterDungeon({seed:2})));
test("rechaza dimensiones fuera de límites",()=>assert.throws(()=>generateStarterDungeon({width:5,height:5}),RangeError));
test("renderiza SVG con dimensiones correctas",()=>{const svg=renderMapSvg(generateStarterDungeon({seed:5,width:12,height:10}),{cellSize:16});assert.match(svg,/width="192" height="160"/);assert.match(svg,/<svg/);});
test("no renderiza mapas inválidos",()=>assert.throws(()=>renderMapSvg({width:4,height:4,tiles:[]}),TypeError));
