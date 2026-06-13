import { useState } from "react";
import { useEditor } from "@/lib/context";
import { TilesetSectionType, TilesetSection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, BookMarked } from "lucide-react";

const NEW_SENTINEL = "__new__";

interface TilesetRegistrationProps {
  brushName: string;
  defaultSectionType: TilesetSectionType;
}

export function TilesetRegistration({ brushName, defaultSectionType }: TilesetRegistrationProps) {
  const { state, dispatch } = useEditor();
  const [open, setOpen] = useState(false);
  const [selectedTilesetId, setSelectedTilesetId] = useState<string>(NEW_SENTINEL);
  const [sectionType, setSectionType] = useState<TilesetSectionType>(defaultSectionType);

  if (!brushName) return null;

  const referencing = state.tilesets.filter((t) =>
    t.sections.some((s) => s.entries.some((e) => e.kind === "brush" && e.name === brushName))
  );

  const alreadyInSelected = (() => {
    if (selectedTilesetId === NEW_SENTINEL) return false;
    const t = state.tilesets.find((t) => t.id === selectedTilesetId);
    if (!t) return false;
    return t.sections.some((s) => s.type === sectionType && s.entries.some((e) => e.kind === "brush" && e.name === brushName));
  })();

  const handleAdd = () => {
    if (selectedTilesetId === NEW_SENTINEL) {
      const id = crypto.randomUUID();
      dispatch({
        type: "ADD_TILESET",
        tileset: {
          id,
          name: brushName,
          sections: [{ type: sectionType, entries: [{ kind: "brush", name: brushName }] }],
        },
      });
      setSelectedTilesetId(id);
      return;
    }
    const tileset = state.tilesets.find((t) => t.id === selectedTilesetId);
    if (!tileset) return;
    const existingSection = tileset.sections.find((s) => s.type === sectionType);
    let sections: TilesetSection[];
    if (existingSection) {
      sections = tileset.sections.map((s) =>
        s.type === sectionType
          ? { ...s, entries: [...s.entries, { kind: "brush" as const, name: brushName }] }
          : s
      );
    } else {
      sections = [...tileset.sections, { type: sectionType, entries: [{ kind: "brush" as const, name: brushName }] }];
    }
    dispatch({ type: "UPDATE_TILESET", id: tileset.id, tileset: { ...tileset, sections } });
  };

  return (
    <div className="pt-4 border-t border-border/40">
      <button
        type="button"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <BookMarked className="w-3.5 h-3.5" />
        Tileset Registration
        {referencing.length > 0 && (
          <span className="ml-1 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-mono">
            {referencing.length}
          </span>
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-3 pl-1">
          {referencing.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Referenced in:</p>
              {referencing.map((t) => (
                <div key={t.id} className="text-xs text-foreground/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block shrink-0" />
                  <span className="font-mono">{t.name}</span>
                  <span className="text-muted-foreground/50">
                    ({t.sections.filter((s) => s.entries.some((e) => e.kind === "brush" && e.name === brushName)).map((s) => s.type).join(", ")})
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedTilesetId} onValueChange={setSelectedTilesetId}>
              <SelectTrigger className="h-8 text-xs flex-1 min-w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NEW_SENTINEL}>Create new tileset…</SelectItem>
                {state.tilesets.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sectionType} onValueChange={(v) => setSectionType(v as TilesetSectionType)}>
              <SelectTrigger className="h-8 text-xs w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terrain">terrain</SelectItem>
                <SelectItem value="doodad">doodad</SelectItem>
                <SelectItem value="raw">raw</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              className="h-8 text-xs shrink-0"
              onClick={handleAdd}
              disabled={alreadyInSelected}
              title={alreadyInSelected ? "Already registered in this tileset section" : undefined}
            >
              + Add
            </Button>
          </div>

          {alreadyInSelected && (
            <p className="text-[11px] text-muted-foreground">Already in this tileset's {sectionType} section.</p>
          )}
        </div>
      )}
    </div>
  );
}
