import { useState } from "react";
import { useEditor } from "@/lib/context";
import { DoodadItem, DoodadElementType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ── Composite tile visual grid ──────────────────────────────────────────────

type CompositeTile = { x: number; y: number; itemId: number };

function CompositeTileGrid({
  tiles,
  onChange,
}: {
  tiles: CompositeTile[];
  onChange: (tiles: CompositeTile[]) => void;
}) {
  const [editingCell, setEditingCell] = useState<{ x: number; y: number } | null>(null);
  const [newItemId, setNewItemId] = useState("");

  const minX = Math.min(0, ...tiles.map((t) => t.x));
  const maxX = Math.max(2, ...tiles.map((t) => t.x));
  const minY = Math.min(0, ...tiles.map((t) => t.y));
  const maxY = Math.max(2, ...tiles.map((t) => t.y));

  const startX = minX - 1;
  const endX   = maxX + 1;
  const startY = minY - 1;
  const endY   = maxY + 1;

  const cols = endX - startX + 1;
  const rows = endY - startY + 1;

  const tileAt = (x: number, y: number) => tiles.find((t) => t.x === x && t.y === y);

  const handleCellClick = (x: number, y: number) => {
    const existing = tileAt(x, y);
    if (existing) {
      onChange(tiles.filter((t) => !(t.x === x && t.y === y)));
      if (editingCell?.x === x && editingCell?.y === y) setEditingCell(null);
    } else {
      setEditingCell({ x, y });
      setNewItemId("");
    }
  };

  const commitAdd = (x: number, y: number) => {
    const id = parseInt(newItemId);
    if (!isNaN(id) && id > 0) onChange([...tiles, { x, y, itemId: id }]);
    setEditingCell(null);
    setNewItemId("");
  };

  const updateItemId = (x: number, y: number, raw: string) => {
    const id = parseInt(raw);
    if (!isNaN(id) && id > 0)
      onChange(tiles.map((t) => (t.x === x && t.y === y ? { ...t, itemId: id } : t)));
  };

  // Larger cells for easier clicking
  const cellSize = 72;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Click an empty cell to place a tile there. Click a filled cell to remove it.
      </p>

      <div
        className="inline-grid gap-1 rounded-lg border border-border/50 bg-sidebar p-2"
        style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}
        data-testid="composite-tile-grid"
      >
        {Array.from({ length: rows }).map((_, rowIdx) =>
          Array.from({ length: cols }).map((_, colIdx) => {
            const x = startX + colIdx;
            const y = startY + rowIdx;
            const tile     = tileAt(x, y);
            const isEditing = editingCell?.x === x && editingCell?.y === y;
            const isOrigin  = x === 0 && y === 0;

            return (
              <div
                key={`${x}-${y}`}
                data-testid={`composite-cell-${x}-${y}`}
                className={[
                  "relative flex flex-col items-center justify-center rounded-md transition-all select-none border",
                  tile
                    ? "bg-primary/20 border-primary/60 cursor-pointer hover:bg-destructive/20 hover:border-destructive/60"
                    : isEditing
                      ? "bg-accent/30 border-primary border-dashed"
                      : isOrigin
                        ? "bg-muted/40 border-border/60 border-dashed cursor-pointer hover:bg-accent/20"
                        : "bg-muted/20 border-border/20 cursor-pointer hover:bg-accent/20 hover:border-border/50",
                ].join(" ")}
                style={{ width: cellSize, height: cellSize }}
                onClick={() => !isEditing && handleCellClick(x, y)}
                title={tile
                  ? `x=${x} y=${y}  id=${tile.itemId} — clique para remover`
                  : `x=${x} y=${y} — clique para adicionar`}
              >
                {/* Coord label */}
                <span className="absolute top-1 left-1.5 text-[10px] font-mono text-muted-foreground/50">
                  {x},{y}
                </span>

                {tile && !isEditing && (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-mono font-bold text-primary">{tile.itemId}</span>
                    <span className="text-[9px] text-muted-foreground/60">click ×</span>
                  </div>
                )}

                {isEditing && (
                  <form
                    className="w-full h-full flex flex-col items-center justify-center gap-1.5 px-2"
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={(e) => { e.preventDefault(); commitAdd(x, y); }}
                  >
                    <Input
                      autoFocus
                      type="number"
                      placeholder="ID"
                      value={newItemId}
                      onChange={(e) => setNewItemId(e.target.value)}
                      className="h-8 w-14 text-sm text-center px-1"
                      data-testid={`composite-cell-input-${x}-${y}`}
                    />
                    <button
                      type="submit"
                      className="text-[11px] font-medium text-primary hover:underline px-2 py-0.5 rounded hover:bg-primary/10 transition-colors"
                    >
                      add
                    </button>
                  </form>
                )}

                {!tile && !isEditing && (
                  <Plus className={`w-4 h-4 ${isOrigin ? "text-muted-foreground/50" : "text-muted-foreground/25"}`} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Editable tile list */}
      {tiles.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground mb-1.5">Edit IDs directly:</p>
          {tiles.map((tile, tIdx) => (
            <div key={tIdx} className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground w-14 shrink-0">
                x={tile.x} y={tile.y}
              </span>
              <Input
                type="number"
                placeholder="Item ID"
                value={tile.itemId || ""}
                onChange={(e) => updateItemId(tile.x, tile.y, e.target.value)}
                className="h-7 text-xs max-w-[110px]"
                data-testid={`composite-tile-id-${tIdx}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => onChange(tiles.filter((_, i) => i !== tIdx))}
                data-testid={`button-remove-tile-${tIdx}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Doodad Editor ──────────────────────────────────────────────────────

export function DoodadEditor() {
  const { state, dispatch } = useEditor();
  const activeItem = state.doodads.find((d) => d.id === state.activeItemId);

  if (!activeItem) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a doodad from the sidebar or create a new one.
      </div>
    );
  }

  const updateField = (field: keyof DoodadItem, value: any) => {
    dispatch({ type: "UPDATE_DOODAD", id: activeItem.id, doodad: { ...activeItem, [field]: value } });
  };

  const addElement = (type: "simple" | "composite" | "alternate") => {
    const newElements = [...activeItem.elements];
    if (type === "simple")       newElements.push({ type: "simple", id: 0, chance: 10 });
    else if (type === "composite") newElements.push({ type: "composite", chance: 10, tiles: [{ x: 0, y: 0, itemId: 0 }, { x: 1, y: 0, itemId: 0 }] });
    else                          newElements.push({ type: "alternate", items: [] });
    updateField("elements", newElements);
  };

  const removeElement = (i: number) => updateField("elements", activeItem.elements.filter((_, idx) => idx !== i));

  const moveElement = (i: number, dir: "up" | "down") => {
    const el = [...activeItem.elements];
    if (dir === "up" && i > 0)                        [el[i - 1], el[i]] = [el[i], el[i - 1]];
    if (dir === "down" && i < el.length - 1)          [el[i + 1], el[i]] = [el[i], el[i + 1]];
    updateField("elements", el);
  };

  const updateElement = (i: number, updated: DoodadElementType) => {
    const el = [...activeItem.elements];
    el[i] = updated;
    updateField("elements", el);
  };

  const TYPE_STYLE: Record<string, string> = {
    simple:    "bg-blue-500/10 border-blue-500/30 text-blue-400",
    composite: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    alternate: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
      <div>
        <h2 className="text-2xl font-bold mb-4">Doodad Configuration</h2>

        {!activeItem.name && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Brush name is required.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="doodad-name">Brush Name *</Label>
            <Input
              id="doodad-name"
              value={activeItem.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              className={!activeItem.name ? "border-destructive focus-visible:ring-destructive" : ""}
              data-testid="input-doodad-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doodad-lookid">Server LookID</Label>
            <Input
              id="doodad-lookid"
              type="number"
              value={activeItem.serverLookId || ""}
              onChange={(e) => updateField("serverLookId", parseInt(e.target.value) || undefined)}
              data-testid="input-doodad-lookid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doodad-thickness">Thickness</Label>
            <Input
              id="doodad-thickness"
              placeholder="e.g. 15/100"
              value={activeItem.thickness || ""}
              onChange={(e) => updateField("thickness", e.target.value)}
              data-testid="input-doodad-thickness"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="doodad-draggable"
              checked={activeItem.draggable}
              onCheckedChange={(c) => updateField("draggable", !!c)}
              data-testid="checkbox-doodad-draggable"
            />
            <Label htmlFor="doodad-draggable" className="font-normal cursor-pointer">Draggable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="doodad-onblocking"
              checked={activeItem.onBlocking}
              onCheckedChange={(c) => updateField("onBlocking", !!c)}
              data-testid="checkbox-doodad-onblocking"
            />
            <Label htmlFor="doodad-onblocking" className="font-normal cursor-pointer">On Blocking</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Elements</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => addElement("simple")}
              className="text-blue-400 border-blue-500/40 hover:bg-blue-500/10"
              data-testid="button-add-simple">
              + Simple
            </Button>
            <Button size="sm" variant="outline" onClick={() => addElement("composite")}
              className="text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
              data-testid="button-add-composite">
              + Composite
            </Button>
            <Button size="sm" variant="outline" onClick={() => addElement("alternate")}
              className="text-purple-400 border-purple-500/40 hover:bg-purple-500/10"
              data-testid="button-add-alternate">
              + Alternate
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {activeItem.elements.map((el, idx) => (
            <div key={idx} className="rounded-lg overflow-hidden border border-border/40" data-testid={`element-${idx}`}>
              <div className={`px-3 py-2 flex items-center justify-between border-b border-border/20 ${TYPE_STYLE[el.type].split(" ")[0]}`}>
                <span className={`text-xs font-mono font-bold uppercase ${TYPE_STYLE[el.type].split(" ")[2]}`}>
                  {el.type}
                  {el.type === "composite" && ` — ${el.tiles.length} tile${el.tiles.length !== 1 ? "s" : ""}`}
                  {el.type === "alternate" && ` — ${el.items.length} item${el.items.length !== 1 ? "s" : ""}`}
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveElement(idx, "up")} disabled={idx === 0} data-testid={`button-move-up-${idx}`}>
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveElement(idx, "down")} disabled={idx === activeItem.elements.length - 1} data-testid={`button-move-down-${idx}`}>
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeElement(idx)} data-testid={`button-remove-element-${idx}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4 bg-card">
                {el.type === "simple" && (
                  <div className="flex gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Item ID</Label>
                      <Input type="number" value={el.id || ""} onChange={(e) => updateElement(idx, { ...el, id: parseInt(e.target.value) || 0 })} className="h-8" data-testid={`input-simple-id-${idx}`} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Chance</Label>
                      <Input type="number" value={el.chance || ""} onChange={(e) => updateElement(idx, { ...el, chance: parseInt(e.target.value) || 0 })} className="h-8" data-testid={`input-simple-chance-${idx}`} />
                    </div>
                  </div>
                )}

                {el.type === "composite" && (
                  <div className="space-y-4">
                    <div className="w-1/3">
                      <Label className="text-xs">Chance</Label>
                      <Input type="number" value={el.chance || ""} onChange={(e) => updateElement(idx, { ...el, chance: parseInt(e.target.value) || 0 })} className="h-8 mt-1" data-testid={`input-composite-chance-${idx}`} />
                    </div>
                    <div>
                      <Label className="text-xs font-bold mb-2 block">Tile Layout</Label>
                      <CompositeTileGrid
                        tiles={el.tiles}
                        onChange={(newTiles) => updateElement(idx, { ...el, tiles: newTiles })}
                      />
                    </div>
                  </div>
                )}

                {el.type === "alternate" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-xs font-bold">Items</Label>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs"
                        onClick={() => updateElement(idx, { ...el, items: [...el.items, { id: 0, chance: 10 }] })}
                        data-testid={`button-add-alternate-item-${idx}`}>
                        <Plus className="w-3 h-3 mr-1" /> Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {el.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-end gap-2">
                          <div className="space-y-0.5 flex-1">
                            <Label className="text-[10px] text-muted-foreground">Item ID</Label>
                            <Input type="number" value={item.id || ""} onChange={(e) => {
                              const n = [...el.items]; n[iIdx] = { ...item, id: parseInt(e.target.value) || 0 };
                              updateElement(idx, { ...el, items: n });
                            }} className="h-8" data-testid={`input-alternate-id-${idx}-${iIdx}`} />
                          </div>
                          <div className="space-y-0.5 flex-1">
                            <Label className="text-[10px] text-muted-foreground">Chance</Label>
                            <Input type="number" value={item.chance || ""} onChange={(e) => {
                              const n = [...el.items]; n[iIdx] = { ...item, chance: parseInt(e.target.value) || 0 };
                              updateElement(idx, { ...el, items: n });
                            }} className="h-8" data-testid={`input-alternate-chance-${idx}-${iIdx}`} />
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => updateElement(idx, { ...el, items: el.items.filter((_, i) => i !== iIdx) })}
                            data-testid={`button-remove-alternate-${idx}-${iIdx}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {el.items.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">
                          No items in alternate block.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          ))}

          {activeItem.elements.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-lg">
              No elements. Use the buttons above to add Simple Items, Composites, or Alternates.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
