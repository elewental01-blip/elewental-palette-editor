import { useState } from "react";
import { useEditor } from "@/lib/context";
import { DoodadItem, DoodadElementType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle, ArrowUp, ArrowDown, Pencil, X, Repeat2 } from "lucide-react";
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
  const [addingCell, setAddingCell]   = useState<{ x: number; y: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ x: number; y: number } | null>(null);
  const [inputVal, setInputVal]       = useState("");

  const minX = Math.min(0, ...tiles.map((t) => t.x));
  const maxX = Math.max(2, ...tiles.map((t) => t.x));
  const minY = Math.min(0, ...tiles.map((t) => t.y));
  const maxY = Math.max(2, ...tiles.map((t) => t.y));

  const startX = minX - 1;
  const endX   = maxX + 1;
  const startY = minY - 1;
  const endY   = maxY + 1;
  const cols   = endX - startX + 1;
  const rows   = endY - startY + 1;

  const tileAt = (x: number, y: number) => tiles.find((t) => t.x === x && t.y === y);

  const startAdding = (x: number, y: number) => {
    setAddingCell({ x, y });
    setEditingCell(null);
    setInputVal("");
  };

  const startEditing = (x: number, y: number, currentId: number) => {
    setEditingCell({ x, y });
    setAddingCell(null);
    setInputVal(String(currentId));
  };

  const commitAdd = (x: number, y: number) => {
    const id = parseInt(inputVal);
    if (!isNaN(id) && id > 0) onChange([...tiles, { x, y, itemId: id }]);
    setAddingCell(null);
    setInputVal("");
  };

  const commitEdit = (x: number, y: number) => {
    const id = parseInt(inputVal);
    if (!isNaN(id) && id > 0)
      onChange(tiles.map((t) => (t.x === x && t.y === y ? { ...t, itemId: id } : t)));
    setEditingCell(null);
    setInputVal("");
  };

  const removeTile = (x: number, y: number) => {
    onChange(tiles.filter((t) => !(t.x === x && t.y === y)));
    setEditingCell(null);
    setAddingCell(null);
  };

  const cancel = () => { setAddingCell(null); setEditingCell(null); setInputVal(""); };

  const CELL = 80; // px — bigger for easier clicking

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Clique numa célula vazia para adicionar um tile; use os botões para editar ou remover.
      </p>

      <div
        className="inline-grid gap-1.5 rounded-lg border border-border/50 bg-sidebar p-2"
        style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)` }}
        data-testid="composite-tile-grid"
      >
        {Array.from({ length: rows }).map((_, rowIdx) =>
          Array.from({ length: cols }).map((_, colIdx) => {
            const x        = startX + colIdx;
            const y        = startY + rowIdx;
            const tile     = tileAt(x, y);
            const isAdding = addingCell?.x === x && addingCell?.y === y;
            const isEdit   = editingCell?.x === x && editingCell?.y === y;
            const isOrigin = x === 0 && y === 0;

            return (
              <div
                key={`${x}-${y}`}
                data-testid={`composite-cell-${x}-${y}`}
                className={[
                  "relative flex flex-col items-center justify-center rounded-md border transition-all select-none",
                  tile
                    ? "bg-primary/15 border-primary/50"
                    : isAdding || isEdit
                      ? "bg-accent/20 border-primary border-dashed"
                      : isOrigin
                        ? "bg-muted/30 border-border/60 border-dashed cursor-pointer hover:bg-accent/20"
                        : "bg-muted/10 border-border/20 cursor-pointer hover:bg-accent/20 hover:border-border/50",
                ].join(" ")}
                style={{ width: CELL, height: CELL }}
                onClick={() => !tile && !isAdding && !isEdit && startAdding(x, y)}
                title={!tile ? `x=${x} y=${y} — clique para adicionar` : undefined}
              >
                {/* Coord */}
                <span className="absolute top-1 left-1.5 text-[9px] font-mono text-muted-foreground/40">
                  {x},{y}
                </span>

                {/* Filled tile — show ID + edit/clear tag buttons */}
                {tile && !isEdit && (
                  <div
                    className="flex flex-col items-center gap-1.5 w-full px-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-base font-mono font-bold text-primary leading-none">
                      {tile.itemId}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(x, y, tile.itemId)}
                        data-testid={`button-edit-tile-${x}-${y}`}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-muted hover:bg-accent border border-border/60 text-[11px] font-medium text-foreground/70 hover:text-foreground transition-colors"
                        title="Editar ID"
                      >
                        <Pencil className="w-3 h-3" />
                        editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTile(x, y)}
                        data-testid={`button-clear-tile-${x}-${y}`}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-muted hover:bg-destructive/20 border border-border/60 hover:border-destructive/50 text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors"
                        title="Remover tile"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Adding new tile */}
                {isAdding && !tile && (
                  <form
                    className="flex flex-col items-center gap-2 w-full px-2"
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={(e) => { e.preventDefault(); commitAdd(x, y); }}
                  >
                    <Input
                      autoFocus
                      type="number"
                      placeholder="ID"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      className="h-8 w-full text-sm text-center px-1"
                      data-testid={`composite-cell-input-${x}-${y}`}
                      onKeyDown={(e) => e.key === "Escape" && cancel()}
                    />
                    <div className="flex gap-1 w-full">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity"
                        data-testid={`composite-cell-add-${x}-${y}`}
                      >
                        <Plus className="w-3 h-3" />
                        add
                      </button>
                      <button
                        type="button"
                        onClick={cancel}
                        className="px-2 py-1.5 rounded bg-muted border border-border/60 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Editing existing tile */}
                {isEdit && tile && (
                  <form
                    className="flex flex-col items-center gap-2 w-full px-2"
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={(e) => { e.preventDefault(); commitEdit(x, y); }}
                  >
                    <Input
                      autoFocus
                      type="number"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      className="h-8 w-full text-sm text-center px-1"
                      data-testid={`composite-cell-edit-input-${x}-${y}`}
                      onKeyDown={(e) => e.key === "Escape" && cancel()}
                    />
                    <div className="flex gap-1 w-full">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity"
                      >
                        ok
                      </button>
                      <button
                        type="button"
                        onClick={cancel}
                        className="px-2 py-1.5 rounded bg-muted border border-border/60 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Empty, not being edited */}
                {!tile && !isAdding && !isEdit && (
                  <Plus className={`w-5 h-5 ${isOrigin ? "text-muted-foreground/40" : "text-muted-foreground/20"}`} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Element card header ─────────────────────────────────────────────────────

function ElementHeader({
  el,
  idx,
  total,
  onMove,
  onRemove,
  onToggleAlternate,
}: {
  el: DoodadElementType;
  idx: number;
  total: number;
  onMove: (dir: "up" | "down") => void;
  onRemove: () => void;
  onToggleAlternate?: () => void;
}) {
  const TYPE_LABEL: Record<string, string> = {
    simple:    "simple",
    composite: "composite",
    alternate: "alternate",
  };
  const TYPE_COLOR: Record<string, string> = {
    simple:    "text-blue-400",
    composite: "text-amber-400",
    alternate: "text-purple-400",
  };
  const TYPE_BG: Record<string, string> = {
    simple:    "bg-blue-500/8 border-blue-500/20",
    composite: "bg-amber-500/8 border-amber-500/20",
    alternate: "bg-purple-500/8 border-purple-500/20",
  };

  const hasAlternate = el.type === "simple" || el.type === "composite";
  const isAlternate  = hasAlternate && (el as any).alternate === true;

  return (
    <div className={`px-3 py-2 flex items-center justify-between border-b border-border/20 ${TYPE_BG[el.type]}`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono font-bold uppercase ${TYPE_COLOR[el.type]}`}>
          {TYPE_LABEL[el.type]}
        </span>
        {el.type === "composite" && (
          <span className="text-[10px] text-muted-foreground">
            {el.tiles.length} tile{el.tiles.length !== 1 ? "s" : ""}
          </span>
        )}
        {el.type === "alternate" && (
          <span className="text-[10px] text-muted-foreground">
            {el.items.length} item{el.items.length !== 1 ? "s" : ""}
          </span>
        )}
        {/* Alternate wrapper toggle for simple & composite */}
        {hasAlternate && (
          <button
            type="button"
            onClick={onToggleAlternate}
            title={isAlternate ? "Remover <alternate> wrapper" : "Envolver em <alternate>"}
            className={[
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors",
              isAlternate
                ? "bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30"
                : "bg-transparent border-border/30 text-muted-foreground/50 hover:border-purple-500/30 hover:text-purple-400/70",
            ].join(" ")}
            data-testid={`button-toggle-alternate-${idx}`}
          >
            <Repeat2 className="w-3 h-3" />
            alternate
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMove("up")} disabled={idx === 0} data-testid={`button-move-up-${idx}`}>
          <ArrowUp className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMove("down")} disabled={idx === total - 1} data-testid={`button-move-down-${idx}`}>
          <ArrowDown className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onRemove} data-testid={`button-remove-element-${idx}`}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
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

  const updateField = (field: keyof DoodadItem, value: any) =>
    dispatch({ type: "UPDATE_DOODAD", id: activeItem.id, doodad: { ...activeItem, [field]: value } });

  const updateElements = (elements: DoodadElementType[]) => updateField("elements", elements);

  const addElement = (type: "simple" | "composite" | "alternate") => {
    const newElements = [...activeItem.elements];
    if (type === "simple")
      newElements.push({ type: "simple", id: 0, chance: 10 });
    else if (type === "composite")
      newElements.push({ type: "composite", chance: 10, tiles: [{ x: 0, y: 0, itemId: 0 }, { x: 1, y: 0, itemId: 0 }] });
    else
      newElements.push({ type: "alternate", items: [] });
    updateElements(newElements);
  };

  const removeElement = (i: number) =>
    updateElements(activeItem.elements.filter((_, idx) => idx !== i));

  const moveElement = (i: number, dir: "up" | "down") => {
    const el = [...activeItem.elements];
    if (dir === "up"   && i > 0)               [el[i - 1], el[i]] = [el[i], el[i - 1]];
    if (dir === "down" && i < el.length - 1)   [el[i + 1], el[i]] = [el[i], el[i + 1]];
    updateElements(el);
  };

  const updateElement = (i: number, updated: DoodadElementType) => {
    const el = [...activeItem.elements];
    el[i] = updated;
    updateElements(el);
  };

  const toggleAlternate = (i: number) => {
    const el = activeItem.elements[i];
    if (el.type === "simple" || el.type === "composite")
      updateElement(i, { ...el, alternate: !el.alternate } as DoodadElementType);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
      {/* Meta fields */}
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
            <Input id="doodad-lookid" type="number" value={activeItem.serverLookId || ""}
              onChange={(e) => updateField("serverLookId", parseInt(e.target.value) || undefined)}
              data-testid="input-doodad-lookid" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doodad-thickness">Thickness</Label>
            <Input id="doodad-thickness" placeholder="e.g. 15/100" value={activeItem.thickness || ""}
              onChange={(e) => updateField("thickness", e.target.value)}
              data-testid="input-doodad-thickness" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="doodad-draggable" checked={activeItem.draggable}
              onCheckedChange={(c) => updateField("draggable", !!c)} data-testid="checkbox-doodad-draggable" />
            <Label htmlFor="doodad-draggable" className="font-normal cursor-pointer">Draggable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="doodad-onblocking" checked={activeItem.onBlocking}
              onCheckedChange={(c) => updateField("onBlocking", !!c)} data-testid="checkbox-doodad-onblocking" />
            <Label htmlFor="doodad-onblocking" className="font-normal cursor-pointer">On Blocking</Label>
          </div>
        </div>
      </div>

      {/* Elements */}
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
              <ElementHeader
                el={el}
                idx={idx}
                total={activeItem.elements.length}
                onMove={(dir) => moveElement(idx, dir)}
                onRemove={() => removeElement(idx)}
                onToggleAlternate={() => toggleAlternate(idx)}
              />

              <CardContent className="p-4 bg-card">
                {/* ── Simple ── */}
                {el.type === "simple" && (
                  <div className="flex gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Item ID</Label>
                      <Input type="number" value={el.id || ""}
                        onChange={(e) => updateElement(idx, { ...el, id: parseInt(e.target.value) || 0 })}
                        className="h-8" data-testid={`input-simple-id-${idx}`} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Chance</Label>
                      <Input type="number" value={el.chance || ""}
                        onChange={(e) => updateElement(idx, { ...el, chance: parseInt(e.target.value) || 0 })}
                        className="h-8" data-testid={`input-simple-chance-${idx}`} />
                    </div>
                  </div>
                )}

                {/* ── Composite ── */}
                {el.type === "composite" && (
                  <div className="space-y-4">
                    <div className="w-1/3">
                      <Label className="text-xs">Chance</Label>
                      <Input type="number" value={el.chance || ""}
                        onChange={(e) => updateElement(idx, { ...el, chance: parseInt(e.target.value) || 0 })}
                        className="h-8 mt-1" data-testid={`input-composite-chance-${idx}`} />
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

                {/* ── Alternate (list-based) ── */}
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
                          No items. Click "Add Item" above.
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
