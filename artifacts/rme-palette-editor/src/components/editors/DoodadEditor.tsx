import { useState } from "react";
import { useEditor } from "@/lib/context";
import { DoodadItem, DoodadElementType, CarpetAlignDirection, CarpetAlignData } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle, ArrowUp, ArrowDown, Pencil, X, Repeat2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { generateTilesetSnippet } from "@/lib/xml-generators";

// ── Composite tile visual grid ───────────────────────────────────────────────

type CompositeTile = { x: number; y: number; itemId: number };

function CompositeTileGrid({ tiles, onChange }: { tiles: CompositeTile[]; onChange: (tiles: CompositeTile[]) => void }) {
  const [addingCell, setAddingCell]   = useState<{ x: number; y: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ x: number; y: number } | null>(null);
  const [inputVal, setInputVal]       = useState("");

  const minX = Math.min(0, ...tiles.map((t) => t.x));
  const maxX = Math.max(2, ...tiles.map((t) => t.x));
  const minY = Math.min(0, ...tiles.map((t) => t.y));
  const maxY = Math.max(2, ...tiles.map((t) => t.y));
  const startX = minX - 1; const endX = maxX + 1;
  const startY = minY - 1; const endY = maxY + 1;
  const cols = endX - startX + 1; const rows = endY - startY + 1;

  const tileAt = (x: number, y: number) => tiles.find((t) => t.x === x && t.y === y);
  const cancel = () => { setAddingCell(null); setEditingCell(null); setInputVal(""); };
  const startAdding  = (x: number, y: number)             => { setAddingCell({ x, y }); setEditingCell(null); setInputVal(""); };
  const startEditing = (x: number, y: number, id: number) => { setEditingCell({ x, y }); setAddingCell(null); setInputVal(String(id)); };

  const commitAdd  = (x: number, y: number) => { const id = parseInt(inputVal); if (!isNaN(id) && id > 0) onChange([...tiles, { x, y, itemId: id }]); cancel(); };
  const commitEdit = (x: number, y: number) => { const id = parseInt(inputVal); if (!isNaN(id) && id > 0) onChange(tiles.map((t) => (t.x === x && t.y === y ? { ...t, itemId: id } : t))); cancel(); };
  const removeTile = (x: number, y: number) => { onChange(tiles.filter((t) => !(t.x === x && t.y === y))); cancel(); };

  const CELL = 96;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">Click an empty cell to add · use ✏ and ✕ to edit or remove</p>
      <div className="inline-grid gap-1.5 rounded-lg border border-border/50 bg-sidebar p-2" style={{ gridTemplateColumns: `repeat(${cols}, ${CELL}px)` }} data-testid="composite-tile-grid">
        {Array.from({ length: rows }).map((_, rowIdx) =>
          Array.from({ length: cols }).map((_, colIdx) => {
            const x = startX + colIdx; const y = startY + rowIdx;
            const tile = tileAt(x, y);
            const isAdding = addingCell?.x === x && addingCell?.y === y;
            const isEdit   = editingCell?.x === x && editingCell?.y === y;
            const isOrigin = x === 0 && y === 0;
            return (
              <div
                key={`${x}-${y}`}
                data-testid={`composite-cell-${x}-${y}`}
                className={["relative flex flex-col items-center justify-center rounded-md border transition-all select-none overflow-hidden",
                  tile ? "bg-primary/15 border-primary/50"
                  : isAdding || isEdit ? "bg-accent/20 border-primary border-dashed"
                  : isOrigin ? "bg-muted/30 border-border/60 border-dashed cursor-pointer hover:bg-accent/20"
                  : "bg-muted/10 border-border/20 cursor-pointer hover:bg-accent/20 hover:border-border/50",
                ].join(" ")}
                style={{ width: CELL, height: CELL }}
                onClick={() => !tile && !isAdding && !isEdit && startAdding(x, y)}
                title={!tile ? `x=${x} y=${y}` : undefined}
              >
                <span className="absolute top-1 left-1.5 text-[9px] font-mono text-muted-foreground/40 pointer-events-none">{x},{y}</span>
                {tile && !isEdit && (
                  <div className="flex flex-col items-center gap-1.5 w-full px-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-base font-mono font-bold text-primary leading-none">{tile.itemId}</span>
                    <div className="flex gap-1.5 w-full justify-center">
                      <button type="button" onClick={() => startEditing(x, y, tile.itemId)} data-testid={`button-edit-tile-${x}-${y}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-muted hover:bg-accent border border-border/50 text-muted-foreground hover:text-foreground transition-colors text-[11px]" title="Edit ID">
                        <Pencil className="w-3 h-3 shrink-0" /><span>edit</span>
                      </button>
                      <button type="button" onClick={() => removeTile(x, y)} data-testid={`button-clear-tile-${x}-${y}`}
                        className="flex items-center justify-center px-2 py-1 rounded bg-muted hover:bg-destructive/20 border border-border/50 hover:border-destructive/50 text-muted-foreground hover:text-destructive transition-colors" title="Remove tile">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                {isAdding && !tile && (
                  <form className="flex flex-col items-center gap-1.5 w-full px-2" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); commitAdd(x, y); }}>
                    <Input autoFocus type="number" placeholder="ID" value={inputVal} onChange={(e) => setInputVal(e.target.value)} className="h-7 w-full text-sm text-center px-1" onKeyDown={(e) => e.key === "Escape" && cancel()} />
                    <div className="flex gap-1 w-full">
                      <button type="submit" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity"><Plus className="w-3 h-3" /> add</button>
                      <button type="button" onClick={cancel} className="px-2 py-1.5 rounded bg-muted border border-border/60 text-muted-foreground hover:text-foreground transition-colors"><X className="w-3 h-3" /></button>
                    </div>
                  </form>
                )}
                {isEdit && tile && (
                  <form className="flex flex-col items-center gap-1.5 w-full px-2" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); commitEdit(x, y); }}>
                    <Input autoFocus type="number" value={inputVal} onChange={(e) => setInputVal(e.target.value)} className="h-7 w-full text-sm text-center px-1" onKeyDown={(e) => e.key === "Escape" && cancel()} />
                    <div className="flex gap-1 w-full">
                      <button type="submit" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity">ok</button>
                      <button type="button" onClick={cancel} className="px-2 py-1.5 rounded bg-muted border border-border/60 text-muted-foreground hover:text-foreground transition-colors"><X className="w-3 h-3" /></button>
                    </div>
                  </form>
                )}
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

// ── Carpet direction cell (embedded in doodad) ────────────────────────────────

function CarpetIcon({ dir }: { dir: CarpetAlignDirection }) {
  const g = "hsl(215 20% 30%)"; const a = "hsl(45 90% 55%)";
  const icons: Record<CarpetAlignDirection, JSX.Element> = {
    n:      (<><rect width="24" height="17" fill={g}/><rect y="17" width="24" height="7" fill={a}/></>),
    s:      (<><rect width="24" height="7" fill={a}/><rect y="7" width="24" height="17" fill={g}/></>),
    e:      (<><rect width="17" height="24" fill={g}/><rect x="17" width="7" height="24" fill={a}/></>),
    w:      (<><rect width="7" height="24" fill={a}/><rect x="7" width="17" height="24" fill={g}/></>),
    cnw:    (<><rect width="24" height="24" fill={g}/><rect x="0" y="0" width="9" height="9" fill={a}/></>),
    cne:    (<><rect width="24" height="24" fill={g}/><rect x="15" y="0" width="9" height="9" fill={a}/></>),
    csw:    (<><rect width="24" height="24" fill={g}/><rect x="0" y="15" width="9" height="9" fill={a}/></>),
    cse:    (<><rect width="24" height="24" fill={g}/><rect x="15" y="15" width="9" height="9" fill={a}/></>),
    dnw:    (<><rect width="24" height="24" fill={g}/><polygon points="0,0 0,14 14,0" fill={a}/></>),
    dne:    (<><rect width="24" height="24" fill={g}/><polygon points="24,0 10,0 24,14" fill={a}/></>),
    dsw:    (<><rect width="24" height="24" fill={g}/><polygon points="0,24 14,24 0,10" fill={a}/></>),
    dse:    (<><rect width="24" height="24" fill={g}/><polygon points="24,24 24,10 10,24" fill={a}/></>),
    center: (<><rect width="24" height="24" fill={g}/><rect x="6" y="6" width="12" height="12" fill={a}/></>),
  };
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} style={{ display: "block", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
      {icons[dir]}
    </svg>
  );
}

type CarpetCellDef = { dir: CarpetAlignDirection; label: string } | { dir: null; label: string };

const CARPET_LAYOUT: CarpetCellDef[] = [
  { dir: "cse", label: "CSE" }, { dir: null, label: "" }, { dir: "n",      label: "N"   }, { dir: null, label: "" }, { dir: "csw",    label: "CSW" },
  { dir: "dse", label: "DSE" }, { dir: null, label: "" }, { dir: null,     label: "" },    { dir: null, label: "" }, { dir: "dsw",    label: "DSW" },
  { dir: null,  label: "" },    { dir: "e",  label: "E" }, { dir: "center", label: "CTR" }, { dir: "w",  label: "W" }, { dir: null,    label: "" },
  { dir: "dne", label: "DNE" }, { dir: null, label: "" }, { dir: null,     label: "" },    { dir: null, label: "" }, { dir: "dnw",    label: "DNW" },
  { dir: "cne", label: "CNE" }, { dir: null, label: "" }, { dir: "s",      label: "S"   }, { dir: null, label: "" }, { dir: "cnw",    label: "CNW" },
];

function CarpetGrid({ carpets, onChange }: { carpets: Partial<Record<CarpetAlignDirection, CarpetAlignData>>; onChange: (c: Partial<Record<CarpetAlignDirection, CarpetAlignData>>) => void; }) {
  const setDir = (dir: CarpetAlignDirection, val: CarpetAlignData | undefined) => {
    const next = { ...carpets };
    if (val === undefined) delete next[dir]; else next[dir] = val;
    onChange(next);
  };

  return (
    <div className="bg-sidebar rounded-lg border border-sidebar-border p-3">
      <div className="grid grid-cols-5 gap-1.5">
        {CARPET_LAYOUT.map((cell, i) => {
          if (cell.dir === null) return <div key={`e-${i}`} />;
          const dir = cell.dir;
          const data = carpets[dir];
          const hasData = !!data;
          const isSingle = data?.type === "single";
          const isMulti  = data?.type === "multi";

          return (
            <div key={dir} className={["flex flex-col rounded border overflow-hidden transition-colors text-[10px]", hasData ? "border-primary/40 bg-card" : "border-border/20 bg-card/40"].join(" ")}>
              <div className="flex items-center gap-1 px-1.5 py-1 border-b border-border/20 bg-muted/20">
                <CarpetIcon dir={dir} />
                <span className="font-mono font-bold text-foreground/70 flex-1">{cell.label}</span>
                {hasData && (
                  <div className="flex gap-0.5">
                    <button type="button" onClick={() => setDir(dir, { type: "single", id: 0 })} className={["px-1 py-0.5 rounded border transition-colors", isSingle ? "bg-primary/20 border-primary/40 text-primary" : "border-border/20 text-muted-foreground"].join(" ")}>S</button>
                    <button type="button" onClick={() => setDir(dir, { type: "multi", items: [] })} className={["px-1 py-0.5 rounded border transition-colors", isMulti ? "bg-primary/20 border-primary/40 text-primary" : "border-border/20 text-muted-foreground"].join(" ")}>M</button>
                    <button type="button" onClick={() => setDir(dir, undefined)} className="px-0.5 py-0.5 rounded border border-border/20 text-muted-foreground hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                  </div>
                )}
              </div>
              {!hasData ? (
                <button type="button" onClick={() => setDir(dir, { type: "single", id: 0 })} className="flex items-center justify-center gap-0.5 px-1 py-2 text-muted-foreground/40 hover:text-primary hover:bg-muted/20 transition-colors">
                  <Plus className="w-2.5 h-2.5" /> add
                </button>
              ) : isSingle ? (
                <div className="px-1.5 py-1.5">
                  <Input type="number" placeholder="ID" value={(data as any).id || ""} onChange={(e) => setDir(dir, { type: "single", id: parseInt(e.target.value) || 0 })} className="h-5 text-[10px] px-1" />
                </div>
              ) : (
                <div className="px-1.5 py-1 space-y-1">
                  {(data as any).items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-0.5 items-center">
                      <Input type="number" placeholder="ID" value={item.id || ""} onChange={(e) => { const items = [...(data as any).items]; items[idx] = { ...item, id: parseInt(e.target.value) || 0 }; setDir(dir, { type: "multi", items }); }} className="h-4 text-[9px] px-0.5 w-12 min-w-0" />
                      <Input type="number" placeholder="%" value={item.chance || ""} onChange={(e) => { const items = [...(data as any).items]; items[idx] = { ...item, chance: parseInt(e.target.value) || 0 }; setDir(dir, { type: "multi", items }); }} className="h-4 text-[9px] px-0.5 w-8 min-w-0" />
                      <button type="button" onClick={() => { const items = (data as any).items.filter((_: any, i: number) => i !== idx); setDir(dir, { type: "multi", items }); }} className="text-muted-foreground hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => { const items = [...(data as any).items, { id: 0, chance: 10 }]; setDir(dir, { type: "multi", items }); }} className="flex items-center gap-0.5 text-[9px] text-primary hover:underline mt-0.5"><Plus className="w-2.5 h-2.5" /> item</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 justify-center text-[10px] text-muted-foreground">
        <span><strong className="text-foreground/60">S</strong> = single ID</span>
        <span><strong className="text-foreground/60">M</strong> = multiple with chance</span>
      </div>
    </div>
  );
}

// ── Element header ─────────────────────────────────────────────────────────────

function ElementHeader({ el, idx, total, onMove, onRemove, onToggleAlternate }: {
  el: DoodadElementType;
  idx: number;
  total: number;
  onMove: (dir: "up" | "down") => void;
  onRemove: () => void;
  onToggleAlternate?: () => void;
}) {
  const TYPE_COLOR: Record<string, string> = {
    simple:    "text-blue-400",
    composite: "text-amber-400",
    alternate: "text-purple-400",
    carpet:    "text-rose-400",
  };
  const TYPE_BG: Record<string, string> = {
    simple:    "bg-blue-500/8 border-blue-500/20",
    composite: "bg-amber-500/8 border-amber-500/20",
    alternate: "bg-purple-500/8 border-purple-500/20",
    carpet:    "bg-rose-500/8 border-rose-500/20",
  };

  const hasAlt = el.type === "simple" || el.type === "composite";
  const isAlt  = hasAlt && (el as any).alternate === true;

  return (
    <div className={`px-3 py-2 flex items-center justify-between border-b border-border/20 ${TYPE_BG[el.type]}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-mono font-bold uppercase ${TYPE_COLOR[el.type]}`}>{el.type}</span>
        {el.type === "composite" && <span className="text-[10px] text-muted-foreground">{el.tiles.length} tiles</span>}
        {el.type === "alternate" && <span className="text-[10px] text-muted-foreground">{el.items.length} items</span>}
        {el.type === "carpet" && <span className="text-[10px] text-muted-foreground">{Object.keys(el.carpets).length} dirs</span>}
        {hasAlt && (
          <button type="button" onClick={onToggleAlternate}
            title={isAlt ? "Remove <alternate> wrapper" : "Wrap in <alternate>"}
            className={["flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors",
              isAlt ? "bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30"
                    : "bg-transparent border-border/30 text-muted-foreground/50 hover:border-purple-500/30 hover:text-purple-400/70",
            ].join(" ")}
            data-testid={`button-toggle-alternate-${idx}`}
          >
            <Repeat2 className="w-3 h-3" /> alternate
          </button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMove("up")} disabled={idx === 0}><ArrowUp className="h-3 w-3" /></Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMove("down")} disabled={idx === total - 1}><ArrowDown className="h-3 w-3" /></Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={onRemove}><Trash2 className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}

// ── Main Doodad Editor ─────────────────────────────────────────────────────────

export function DoodadEditor() {
  const { state, dispatch } = useEditor();
  const { toast } = useToast();
  const activeItem = state.doodads.find((d) => d.id === state.activeItemId);

  if (!activeItem) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a doodad from the sidebar or create a new one.
      </div>
    );
  }

  const updateField    = (field: keyof DoodadItem, value: any) => dispatch({ type: "UPDATE_DOODAD", id: activeItem.id, doodad: { ...activeItem, [field]: value } });
  const updateElements = (elements: DoodadElementType[]) => updateField("elements", elements);

  const addElement = (type: "simple" | "composite" | "alternate" | "carpet") => {
    const n = [...activeItem.elements];
    if (type === "simple")    n.push({ type: "simple", id: 0, chance: 10 });
    else if (type === "composite") n.push({ type: "composite", chance: 10, tiles: [{ x: 0, y: 0, itemId: 0 }, { x: 1, y: 0, itemId: 0 }] });
    else if (type === "alternate") n.push({ type: "alternate", items: [] });
    else                      n.push({ type: "carpet", carpets: {} });
    updateElements(n);
  };

  const removeElement  = (i: number) => updateElements(activeItem.elements.filter((_, idx) => idx !== i));
  const moveElement    = (i: number, dir: "up" | "down") => {
    const el = [...activeItem.elements];
    if (dir === "up"   && i > 0)             [el[i - 1], el[i]] = [el[i], el[i - 1]];
    if (dir === "down" && i < el.length - 1) [el[i + 1], el[i]] = [el[i], el[i + 1]];
    updateElements(el);
  };
  const updateElement  = (i: number, updated: DoodadElementType) => { const el = [...activeItem.elements]; el[i] = updated; updateElements(el); };
  const toggleAlternate = (i: number) => {
    const el = activeItem.elements[i];
    if (el.type === "simple" || el.type === "composite")
      updateElement(i, { ...el, alternate: !el.alternate } as DoodadElementType);
  };

  const isCarpetDoodad = activeItem.elements.some((el) => el.type === "carpet");

  const copyTilesetXml = async () => {
    const xml = generateTilesetSnippet(activeItem.name, "doodad");
    try {
      await navigator.clipboard.writeText(xml);
      toast({ title: "Copied!", description: "Tileset registration XML copied to clipboard." });
    } catch {
      toast({ title: "Error", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {isCarpetDoodad ? "Carpet Configuration" : "Doodad Configuration"}
        </h2>
        {!activeItem.name && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Brush name is required.</AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="doodad-name">Brush Name *</Label>
            <Input id="doodad-name" value={activeItem.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              className={!activeItem.name ? "border-destructive" : ""}
              data-testid="input-doodad-name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doodad-lookid">Server LookID</Label>
            <Input id="doodad-lookid" type="number" value={activeItem.serverLookId || ""}
              onChange={(e) => updateField("serverLookId", parseInt(e.target.value) || undefined)}
              data-testid="input-doodad-lookid" />
          </div>
          {!isCarpetDoodad && (
            <div className="space-y-2">
              <Label htmlFor="doodad-thickness">Thickness</Label>
              <Input id="doodad-thickness" placeholder="e.g. 15/100" value={activeItem.thickness || ""}
                onChange={(e) => updateField("thickness", e.target.value)}
                data-testid="input-doodad-thickness" />
            </div>
          )}
          {!isCarpetDoodad && (
            <div className="flex items-center space-x-2">
              <Checkbox id="doodad-draggable" checked={activeItem.draggable}
                onCheckedChange={(c) => updateField("draggable", !!c)} />
              <Label htmlFor="doodad-draggable" className="font-normal cursor-pointer">Draggable</Label>
            </div>
          )}
          {!isCarpetDoodad && (
            <div className="flex items-center space-x-2">
              <Checkbox id="doodad-onblocking" checked={activeItem.onBlocking}
                onCheckedChange={(c) => updateField("onBlocking", !!c)} />
              <Label htmlFor="doodad-onblocking" className="font-normal cursor-pointer">On Blocking</Label>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Elements</h3>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="text-blue-400 border-blue-500/40 hover:bg-blue-500/10"
              onClick={() => addElement("simple")} data-testid="button-add-simple">+ Simple</Button>
            <Button size="sm" variant="outline" className="text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
              onClick={() => addElement("composite")} data-testid="button-add-composite">+ Composite</Button>
            <Button size="sm" variant="outline" className="text-purple-400 border-purple-500/40 hover:bg-purple-500/10"
              onClick={() => addElement("alternate")} data-testid="button-add-alternate">+ Alternate</Button>
            <Button size="sm" variant="outline" className="text-rose-400 border-rose-500/40 hover:bg-rose-500/10"
              onClick={() => addElement("carpet")} data-testid="button-add-carpet">+ Carpet</Button>
          </div>
        </div>

        <div className="space-y-3">
          {activeItem.elements.map((el, idx) => (
            <div key={idx} className="rounded-lg overflow-hidden border border-border/40" data-testid={`element-${idx}`}>
              <ElementHeader el={el} idx={idx} total={activeItem.elements.length}
                onMove={(dir) => moveElement(idx, dir)}
                onRemove={() => removeElement(idx)}
                onToggleAlternate={() => toggleAlternate(idx)}
              />
              <CardContent className="p-4 bg-card">
                {el.type === "simple" && (
                  <div className="flex gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Item ID</Label>
                      <Input type="number" value={el.id || ""} className="h-8" onChange={(e) => updateElement(idx, { ...el, id: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Chance</Label>
                      <Input type="number" value={el.chance || ""} className="h-8" onChange={(e) => updateElement(idx, { ...el, chance: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                )}
                {el.type === "composite" && (
                  <div className="space-y-4">
                    <div className="w-1/3">
                      <Label className="text-xs">Chance</Label>
                      <Input type="number" value={el.chance || ""} className="h-8 mt-1" onChange={(e) => updateElement(idx, { ...el, chance: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div>
                      <Label className="text-xs font-bold mb-2 block">Tile Layout</Label>
                      <CompositeTileGrid tiles={el.tiles} onChange={(newTiles) => updateElement(idx, { ...el, tiles: newTiles })} />
                    </div>
                  </div>
                )}
                {el.type === "alternate" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-xs font-bold">Items</Label>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs"
                        onClick={() => updateElement(idx, { ...el, items: [...el.items, { id: 0, chance: 10 }] })}>
                        <Plus className="w-3 h-3 mr-1" /> Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {el.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-end gap-2">
                          <div className="space-y-0.5 flex-1">
                            <Label className="text-[10px] text-muted-foreground">Item ID</Label>
                            <Input type="number" value={item.id || ""} className="h-8"
                              onChange={(e) => { const n = [...el.items]; n[iIdx] = { ...item, id: parseInt(e.target.value) || 0 }; updateElement(idx, { ...el, items: n }); }} />
                          </div>
                          <div className="space-y-0.5 flex-1">
                            <Label className="text-[10px] text-muted-foreground">Chance</Label>
                            <Input type="number" value={item.chance || ""} className="h-8"
                              onChange={(e) => { const n = [...el.items]; n[iIdx] = { ...item, chance: parseInt(e.target.value) || 0 }; updateElement(idx, { ...el, items: n }); }} />
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => updateElement(idx, { ...el, items: el.items.filter((_, i) => i !== iIdx) })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {el.items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">No items. Click "Add Item" above.</p>}
                    </div>
                  </div>
                )}
                {el.type === "carpet" && (
                  <div>
                    <Label className="text-xs font-bold mb-3 block">Carpet Direction Grid</Label>
                    <CarpetGrid
                      carpets={el.carpets}
                      onChange={(newCarpets) => updateElement(idx, { ...el, carpets: newCarpets })}
                    />
                  </div>
                )}
              </CardContent>
            </div>
          ))}

          {activeItem.elements.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-lg">
              No elements. Use the buttons above to add Simple Items, Composites, Alternates, or Carpets.
            </p>
          )}
        </div>
      </div>

      {/* Tileset registration */}
      {activeItem.name && (
        <div className="pt-4 border-t border-border/40">
          <Button variant="outline" onClick={copyTilesetXml} className="gap-2">
            Copy tilesets.xml Registration
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Copies a <code className="font-mono">&lt;tileset&gt;</code> snippet for <code className="font-mono">{activeItem.name}</code> to paste into <code className="font-mono">tilesets.xml</code>.
          </p>
        </div>
      )}
    </div>
  );
}
