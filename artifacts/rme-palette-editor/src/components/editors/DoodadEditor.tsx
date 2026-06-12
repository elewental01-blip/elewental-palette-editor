import { useEditor } from "@/lib/context";
import { DoodadItem, DoodadElementType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    dispatch({
      type: "UPDATE_DOODAD",
      id: activeItem.id,
      doodad: { ...activeItem, [field]: value },
    });
  };

  const addElement = (type: "simple" | "composite" | "alternate") => {
    const newElements = [...activeItem.elements];
    if (type === "simple") {
      newElements.push({ type: "simple", id: 0, chance: 10 });
    } else if (type === "composite") {
      newElements.push({ type: "composite", chance: 10, tiles: [] });
    } else if (type === "alternate") {
      newElements.push({ type: "alternate", items: [] });
    }
    updateField("elements", newElements);
  };

  const removeElement = (index: number) => {
    updateField("elements", activeItem.elements.filter((_, i) => i !== index));
  };

  const moveElement = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const el = [...activeItem.elements];
      [el[index - 1], el[index]] = [el[index], el[index - 1]];
      updateField("elements", el);
    } else if (direction === "down" && index < activeItem.elements.length - 1) {
      const el = [...activeItem.elements];
      [el[index + 1], el[index]] = [el[index], el[index + 1]];
      updateField("elements", el);
    }
  };

  const updateElement = (index: number, updated: DoodadElementType) => {
    const el = [...activeItem.elements];
    el[index] = updated;
    updateField("elements", el);
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doodad-lookid">Server LookID</Label>
            <Input
              id="doodad-lookid"
              type="number"
              value={activeItem.serverLookId || ""}
              onChange={(e) => updateField("serverLookId", parseInt(e.target.value) || undefined)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doodad-thickness">Thickness</Label>
            <Input
              id="doodad-thickness"
              placeholder="e.g. 15/100"
              value={activeItem.thickness || ""}
              onChange={(e) => updateField("thickness", e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="doodad-draggable" checked={activeItem.draggable} onCheckedChange={(c) => updateField("draggable", !!c)} />
            <Label htmlFor="doodad-draggable" className="font-normal cursor-pointer">Draggable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="doodad-onblocking" checked={activeItem.onBlocking} onCheckedChange={(c) => updateField("onBlocking", !!c)} />
            <Label htmlFor="doodad-onblocking" className="font-normal cursor-pointer">On Blocking</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Elements</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => addElement("simple")}>+ Simple</Button>
            <Button size="sm" variant="outline" onClick={() => addElement("composite")}>+ Composite</Button>
            <Button size="sm" variant="outline" onClick={() => addElement("alternate")}>+ Alternate</Button>
          </div>
        </div>

        <div className="space-y-3">
          {activeItem.elements.map((el, idx) => (
            <Card key={idx} className="overflow-hidden border-border/50">
              <div className="bg-muted px-3 py-2 flex items-center justify-between border-b border-border/50">
                <span className="text-xs font-mono font-bold uppercase text-muted-foreground">{el.type}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveElement(idx, "up")} disabled={idx === 0}><ArrowUp className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveElement(idx, "down")} disabled={idx === activeItem.elements.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeElement(idx)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              <CardContent className="p-3">
                {el.type === "simple" && (
                  <div className="flex items-center gap-4">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Item ID</Label>
                      <Input type="number" value={el.id || ""} onChange={(e) => updateElement(idx, { ...el, id: parseInt(e.target.value) || 0 })} className="h-8" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Chance</Label>
                      <Input type="number" value={el.chance || ""} onChange={(e) => updateElement(idx, { ...el, chance: parseInt(e.target.value) || 0 })} className="h-8" />
                    </div>
                  </div>
                )}

                {el.type === "composite" && (
                  <div className="space-y-4">
                    <div className="space-y-1 w-1/3">
                      <Label className="text-xs">Chance</Label>
                      <Input type="number" value={el.chance || ""} onChange={(e) => updateElement(idx, { ...el, chance: parseInt(e.target.value) || 0 })} className="h-8" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-bold">Tiles</Label>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => updateElement(idx, { ...el, tiles: [...el.tiles, { x: 0, y: 0, itemId: 0 }] })}>+ Add Tile</Button>
                      </div>
                      <div className="space-y-2">
                        {el.tiles.map((tile, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <Input type="number" placeholder="X" value={tile.x} onChange={(e) => {
                              const newTiles = [...el.tiles];
                              newTiles[tIdx] = { ...tile, x: parseInt(e.target.value) || 0 };
                              updateElement(idx, { ...el, tiles: newTiles });
                            }} className="h-8 w-16" />
                            <Input type="number" placeholder="Y" value={tile.y} onChange={(e) => {
                              const newTiles = [...el.tiles];
                              newTiles[tIdx] = { ...tile, y: parseInt(e.target.value) || 0 };
                              updateElement(idx, { ...el, tiles: newTiles });
                            }} className="h-8 w-16" />
                            <Input type="number" placeholder="Item ID" value={tile.itemId || ""} onChange={(e) => {
                              const newTiles = [...el.tiles];
                              newTiles[tIdx] = { ...tile, itemId: parseInt(e.target.value) || 0 };
                              updateElement(idx, { ...el, tiles: newTiles });
                            }} className="h-8 flex-1" />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                              const newTiles = el.tiles.filter((_, i) => i !== tIdx);
                              updateElement(idx, { ...el, tiles: newTiles });
                            }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {el.type === "alternate" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-bold">Items</Label>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => updateElement(idx, { ...el, items: [...el.items, { id: 0, chance: 10 }] })}>+ Add Item</Button>
                    </div>
                    <div className="space-y-2">
                      {el.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-center gap-2">
                          <Input type="number" placeholder="Item ID" value={item.id || ""} onChange={(e) => {
                            const newItems = [...el.items];
                            newItems[iIdx] = { ...item, id: parseInt(e.target.value) || 0 };
                            updateElement(idx, { ...el, items: newItems });
                          }} className="h-8 flex-1" />
                          <Input type="number" placeholder="Chance" value={item.chance || ""} onChange={(e) => {
                            const newItems = [...el.items];
                            newItems[iIdx] = { ...item, chance: parseInt(e.target.value) || 0 };
                            updateElement(idx, { ...el, items: newItems });
                          }} className="h-8 flex-1" />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                            const newItems = el.items.filter((_, i) => i !== iIdx);
                            updateElement(idx, { ...el, items: newItems });
                          }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {activeItem.elements.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-lg">No elements added.</p>}
        </div>
      </div>
    </div>
  );
}
