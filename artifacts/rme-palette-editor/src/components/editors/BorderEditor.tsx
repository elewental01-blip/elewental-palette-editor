import { useState } from "react";
import { useEditor } from "@/lib/context";
import { BorderItem, BorderDirection } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import borderSpriteUrl from "@assets/image_1781267538292.png";

// Maps each direction to its (col, row) position in the 5x5 sprite image.
// The image is a 5-column × 5-row grid of tile sprites.
// background-size: 500% 500%  →  position = (col/4 * 100%)  (row/4 * 100%)
const SPRITE_POSITIONS: Record<BorderDirection, string> = {
  cse: "0% 0%",
  csw: "100% 0%",
  dse: "0% 25%",
  n:   "50% 25%",
  dsw: "100% 25%",
  e:   "25% 50%",
  w:   "75% 50%",
  dne: "0% 75%",
  s:   "50% 75%",
  dnw: "100% 75%",
  cne: "0% 100%",
  cnw: "100% 100%",
};

const DIRECTION_LABELS: Record<BorderDirection, string> = {
  n: "N", s: "S", e: "E", w: "W",
  cnw: "CNW", cne: "CNE", csw: "CSW", cse: "CSE",
  dnw: "DNW", dne: "DNE", dsw: "DSW", dse: "DSE",
};

export function BorderEditor() {
  const { state, dispatch } = useEditor();
  const activeItem = state.borders.find((b) => b.id === state.activeItemId);
  const [activeDir, setActiveDir] = useState<BorderDirection | null>(null);

  if (!activeItem) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a border from the sidebar or create a new one.
      </div>
    );
  }

  const updateField = (field: keyof BorderItem, value: any) => {
    dispatch({
      type: "UPDATE_BORDER",
      id: activeItem.id,
      border: { ...activeItem, [field]: value },
    });
  };

  const updateDirection = (dir: BorderDirection, value: number[]) => {
    dispatch({
      type: "UPDATE_BORDER",
      id: activeItem.id,
      border: { ...activeItem, items: { ...activeItem.items, [dir]: value } },
    });
  };

  // 5×5 layout — matches RME reference image
  const layout: (BorderDirection | "empty" | "ctr")[] = [
    "cse",   "empty", "n",     "empty", "csw",
    "dse",   "empty", "empty", "empty", "dsw",
    "empty", "e",     "ctr",   "w",     "empty",
    "dne",   "empty", "empty", "empty", "dnw",
    "cne",   "empty", "s",     "empty", "cnw",
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
      <div>
        <h2 className="text-2xl font-bold mb-4">Border Configuration</h2>

        {!activeItem.borderId && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Border ID is required.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="border-id">Border ID *</Label>
            <Input
              id="border-id"
              type="number"
              value={activeItem.borderId || ""}
              onChange={(e) => updateField("borderId", parseInt(e.target.value) || 0)}
              data-testid="input-border-id"
              className={!activeItem.borderId ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="border-group">Group ID (optional)</Label>
            <Input
              id="border-group"
              type="number"
              value={activeItem.group || ""}
              onChange={(e) => updateField("group", parseInt(e.target.value) || undefined)}
              data-testid="input-border-group"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="border-comment">Comment (optional)</Label>
            <Input
              id="border-comment"
              value={activeItem.comment || ""}
              onChange={(e) => updateField("comment", e.target.value)}
              data-testid="input-border-comment"
            />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Visual Grid</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveDir(null);
              updateField("items", {
                n: [], s: [], e: [], w: [],
                cnw: [], cne: [], csw: [], cse: [],
                dnw: [], dne: [], dsw: [], dse: [],
              });
            }}
            data-testid="button-clear-border-items"
          >
            Clear All
          </Button>
        </div>

        <div className="bg-sidebar rounded-xl border border-sidebar-border p-6">
          <div className="grid grid-cols-5 gap-3 max-w-3xl mx-auto">
            {layout.map((cell, i) => {
              if (cell === "empty") {
                return <div key={`empty-${i}`} className="h-28 pointer-events-none" />;
              }

              if (cell === "ctr") {
                return (
                  <div
                    key="ctr"
                    className="h-28 rounded-lg overflow-hidden border border-border/40 flex items-center justify-center pointer-events-none"
                    style={{
                      backgroundImage: `url(${borderSpriteUrl})`,
                      backgroundSize: "500% 500%",
                      backgroundPosition: "50% 50%",
                      backgroundRepeat: "no-repeat",
                      opacity: 0.55,
                    }}
                  />
                );
              }

              const dir = cell as BorderDirection;
              const items = activeItem.items[dir] || [];
              const isActive = activeDir === dir;
              const hasItems = items.length > 0;

              return (
                <div
                  key={dir}
                  data-testid={`border-cell-${dir}`}
                  onClick={() => setActiveDir(isActive ? null : dir)}
                  className={[
                    "h-28 rounded-lg overflow-hidden border cursor-pointer transition-all relative flex flex-col",
                    isActive
                      ? "border-primary ring-2 ring-primary/40"
                      : hasItems
                        ? "border-primary/50 hover:border-primary/70"
                        : "border-border/50 hover:border-border",
                  ].join(" ")}
                >
                  {/* Sprite background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${borderSpriteUrl})`,
                      backgroundSize: "500% 500%",
                      backgroundPosition: SPRITE_POSITIONS[dir],
                      backgroundRepeat: "no-repeat",
                      opacity: 0.35,
                    }}
                  />

                  {/* Direction label */}
                  <div
                    className={[
                      "relative z-10 px-2 py-1 text-[11px] font-mono font-bold border-b",
                      isActive
                        ? "bg-primary/80 text-primary-foreground border-primary/50"
                        : "bg-card/70 text-muted-foreground border-border/40 backdrop-blur-sm",
                    ].join(" ")}
                  >
                    {DIRECTION_LABELS[dir]}
                    {hasItems && (
                      <span className="ml-1 text-primary text-[9px]">
                        ({items.length})
                      </span>
                    )}
                  </div>

                  {/* Item badges */}
                  <div className="relative z-10 p-1.5 flex flex-wrap gap-1 flex-1 content-start overflow-hidden">
                    {items.map((item, idx) => (
                      <Badge
                        key={`${dir}-${idx}`}
                        variant="secondary"
                        className="px-1 py-0 h-4 text-[9px] gap-0.5 pr-0.5 bg-card/90"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDirection(dir, items.filter((_, i) => i !== idx));
                          }}
                          className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inline editor panel for selected direction */}
        {activeDir && (
          <div className="mt-4 border border-primary/30 rounded-lg p-4 bg-card animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="font-mono font-bold text-primary text-sm">
                {DIRECTION_LABELS[activeDir]}
              </div>
              <div
                className="w-8 h-8 rounded border border-border"
                style={{
                  backgroundImage: `url(${borderSpriteUrl})`,
                  backgroundSize: "500% 500%",
                  backgroundPosition: SPRITE_POSITIONS[activeDir],
                  backgroundRepeat: "no-repeat",
                }}
              />
              <span className="text-xs text-muted-foreground">
                Add item IDs for this border direction
              </span>
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem("val") as HTMLInputElement;
                const val = parseInt(input.value);
                if (val && !isNaN(val)) {
                  const items = activeItem.items[activeDir] || [];
                  updateDirection(activeDir, [...items, val]);
                  input.value = "";
                }
              }}
            >
              <Input
                name="val"
                type="number"
                placeholder="Enter item ID and press Enter..."
                className="h-8 text-sm max-w-xs"
                autoFocus
                data-testid={`input-direction-${activeDir}`}
              />
              <Button type="submit" size="sm" className="h-8" data-testid={`button-add-${activeDir}`}>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </form>
            {(activeItem.items[activeDir] || []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(activeItem.items[activeDir] || []).map((item, idx) => (
                  <Badge key={idx} variant="outline" className="px-2 py-0.5 text-xs gap-1.5">
                    {item}
                    <button
                      onClick={() => {
                        const items = activeItem.items[activeDir] || [];
                        updateDirection(activeDir, items.filter((_, i) => i !== idx));
                      }}
                      className="hover:text-destructive transition-colors"
                      data-testid={`button-remove-${activeDir}-${idx}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
