import { BorderItem, GroundItem, DoodadItem, WallItem } from "./types";

export function generateBordersXml(borders: BorderItem[]): string {
  let xml = `<materials>\n`;
  for (const border of borders) {
    if (!border.borderId) continue;
    xml += `  <border id="${border.borderId}"${border.group ? ` group="${border.group}"` : ""}>${border.comment ? ` <!-- ${border.comment} -->` : ""}\n`;
    
    const directions = ["n", "w", "e", "s", "cnw", "cne", "cse", "csw", "dnw", "dne", "dse", "dsw"] as const;
    for (const dir of directions) {
      if (border.items[dir]) {
        for (const item of border.items[dir]) {
          xml += `    <borderitem edge="${dir}" item="${item}"/>\n`;
        }
      }
    }
    xml += `  </border>\n`;
  }
  xml += `</materials>`;
  return xml;
}

export function generateGroundsXml(grounds: GroundItem[]): string {
  let xml = `<materials>\n`;
  for (const ground of grounds) {
    if (!ground.name) continue;
    
    let attrs = `name="${ground.name}" type="ground"`;
    if (ground.serverLookId) attrs += ` server_lookid="${ground.serverLookId}"`;
    if (ground.zOrder) attrs += ` z-order="${ground.zOrder}"`;
    
    xml += `  <brush ${attrs}>\n`;
    
    for (const item of ground.items) {
      xml += `    <item id="${item.id}" chance="${item.chance}"/>\n`;
    }
    
    for (const border of ground.borders) {
      let bAttrs = `align="${border.align}"`;
      if (border.to) bAttrs += ` to="${border.to}"`;
      bAttrs += ` id="${border.id}"`;
      xml += `    <border ${bAttrs}/>\n`;
    }
    
    for (const friend of ground.friends) {
      xml += `    <friend name="${friend}"/>\n`;
    }
    
    xml += `  </brush>\n`;
  }
  xml += `</materials>`;
  return xml;
}

export function generateDoodadsXml(doodads: DoodadItem[]): string {
  let xml = `<materials>\n`;
  for (const doodad of doodads) {
    if (!doodad.name) continue;
    
    let attrs = `name="${doodad.name}" type="doodad"`;
    if (doodad.serverLookId) attrs += ` server_lookid="${doodad.serverLookId}"`;
    if (doodad.draggable !== undefined) attrs += ` draggable="${doodad.draggable}"`;
    if (doodad.onBlocking !== undefined) attrs += ` on_blocking="${doodad.onBlocking}"`;
    if (doodad.thickness) attrs += ` thickness="${doodad.thickness}"`;
    
    xml += `  <brush ${attrs}>\n`;
    
    for (const el of doodad.elements) {
      if (el.type === "simple") {
        xml += `    <item id="${el.id}" chance="${el.chance}"/>\n`;
      } else if (el.type === "composite") {
        xml += `    <composite chance="${el.chance}">\n`;
        for (const tile of el.tiles) {
          xml += `      <tile x="${tile.x}" y="${tile.y}"> <item id="${tile.itemId}"/> </tile>\n`;
        }
        xml += `    </composite>\n`;
      } else if (el.type === "alternate") {
        xml += `    <alternate>\n`;
        for (const item of el.items) {
          xml += `      <item id="${item.id}" chance="${item.chance}"/>\n`;
        }
        xml += `    </alternate>\n`;
      }
    }
    
    xml += `  </brush>\n`;
  }
  xml += `</materials>`;
  return xml;
}

export function generateWallsXml(walls: WallItem[]): string {
  let xml = `<materials>\n`;
  for (const wall of walls) {
    if (!wall.name) continue;
    
    let attrs = `name="${wall.name}" type="wall"`;
    if (wall.serverLookId) attrs += ` server_lookid="${wall.serverLookId}"`;
    if (wall.draggable !== undefined) attrs += ` draggable="${wall.draggable}"`;
    if (wall.onBlocking !== undefined) attrs += ` on_blocking="${wall.onBlocking}"`;
    if (wall.thickness) attrs += ` thickness="${wall.thickness}"`;
    
    xml += `  <brush ${attrs}>\n`;
    
    if (wall.alternate && wall.alternate.length > 0) {
      xml += `    <alternate>\n`;
      for (const item of wall.alternate) {
        xml += `      <item id="${item.id}" chance="${item.chance}"/>\n`;
      }
      xml += `    </alternate>\n`;
    } else if (wall.walls) {
      const types = ["horizontal", "vertical", "corner", "pole"] as const;
      for (const t of types) {
        const data = wall.walls[t];
        if (data && (data.items.length > 0 || data.doors.length > 0)) {
          xml += `    <wall type="${t}">\n`;
          for (const item of data.items) {
            xml += `      <item id="${item.id}" chance="${item.chance}"/>\n`;
          }
          for (const door of data.doors) {
            let dAttrs = `id="${door.id}" type="${door.type}"`;
            if (door.open !== undefined) dAttrs += ` open="${door.open}"`;
            if (door.locked !== undefined) dAttrs += ` locked="${door.locked}"`;
            xml += `      <door ${dAttrs}/>\n`;
          }
          xml += `    </wall>\n`;
        }
      }
    }
    
    if (wall.friends) {
      for (const friend of wall.friends) {
        xml += `    <friend name="${friend.name}"${friend.redirect !== undefined ? ` redirect="${friend.redirect}"` : ""}/>\n`;
      }
    }
    
    xml += `  </brush>\n`;
  }
  xml += `</materials>`;
  return xml;
}
