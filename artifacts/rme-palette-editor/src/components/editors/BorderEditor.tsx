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

export function BorderEditor() {
  const { state, dispatch } = useEditor();
  const activeItem = state.borders.find((b) => b.id === state.activeItemId);

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

  const layout: (BorderDirection | "empty" | "ctr")[] = [
    "cse", "empty", "n", "empty", "csw",
    "dse", "empty", "empty", "empty", "dsw",
    "empty", "e", "ctr", "w", "empty",
    "dne", "empty", "empty", "empty", "dnw",
    "cne", "empty", "s", "empty", "cnw",
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
          <h2 className="text-xl font-bold">Visual Grid Layout</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateField("items", {
                n: [], s: [], e: [], w: [], cnw: [], cne: [], csw: [], cse: [], dnw: [], dne: [], dsw: [], dse: []
              });
            }}
            data-testid="button-clear-border-items"
          >
            Clear All Tiles
          </Button>
        </div>
        
        <div className="bg-sidebar p-6 rounded-xl border border-sidebar-border">
          <div className="grid grid-cols-5 gap-3 max-w-3xl mx-auto">
            {layout.map((cell, i) => {
              if (cell === "empty") {
                return <div key={`empty-${i}`} className="h-24 pointer-events-none" />;
              }
              
              if (cell === "ctr") {
                return (
                  <div key={`ctr-${i}`} className="h-24 bg-card/50 border border-border/50 rounded-lg flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-sm bg-muted-foreground/20" />
                  </div>
                );
              }

              const dir = cell as BorderDirection;
              const items = activeItem.items[dir] || [];

              return (
                <Card key={dir} className="h-28 overflow-hidden bg-card border-border hover:border-primary/50 transition-colors">
                  <div className="bg-muted px-2 py-1 text-xs font-mono font-bold text-muted-foreground border-b border-border uppercase">
                    {dir}
                  </div>
                  <CardContent className="p-2 space-y-2 h-[calc(100%-24px)] flex flex-col">
                    <div className="flex flex-wrap gap-1 flex-1 content-start overflow-y-auto min-h-0 custom-scrollbar">
                      {items.map((item, idx) => (
                        <Badge key={`${dir}-${idx}`} variant="secondary" className="px-1 py-0 h-5 text-[10px] gap-1 pr-0.5">
                          {item}
                          <button
                            onClick={() => updateDirection(dir, items.filter((_, i) => i !== idx))}
                            className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 ml-1 transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <form 
                      className="flex items-center mt-auto"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.target as HTMLFormElement).elements.namedItem("val") as HTMLInputElement;
                        const val = parseInt(input.value);
                        if (val && !isNaN(val)) {
                          updateDirection(dir, [...items, val]);
                          input.value = "";
                        }
                      }}
                    >
                      <Input 
                        name="val"
                        placeholder="Add ID..." 
                        className="h-6 text-xs px-1.5 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 border-r-0 rounded-r-none"
                      />
                      <Button type="submit" size="icon" className="h-6 w-6 rounded-l-none shrink-0 border border-primary border-l-0">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
