import { useState, useEffect } from "react";
import { useEditor } from "@/lib/context";
import { Category } from "@/lib/context";
import { BorderEditor } from "@/components/editors/BorderEditor";
import { GroundEditor } from "@/components/editors/GroundEditor";
import { DoodadEditor } from "@/components/editors/DoodadEditor";
import { CarpetEditor } from "@/components/editors/CarpetEditor";
import { WallEditor } from "@/components/editors/WallEditor";
import { TilesetEditor } from "@/components/editors/TilesetEditor";
import { XmlPreview } from "@/components/XmlPreview";
import {
  Layers, Image as ImageIcon, Box, BrickWall, Database,
  Plus, Trash2, ChevronLeft, ChevronRight, Moon, Sun,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// ── Dodecagram icon ────────────────────────────────────────────────────────────
function DodecagramIcon({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} style={{ display: "block", flexShrink: 0 }}>
      <polygon
        points="16,2 18.61,6.24 23,3.88 23.14,8.86 28.12,9 25.76,13.39 30,16 25.76,18.61 28.12,23 23.14,23.14 23,28.12 18.61,25.76 16,30 13.39,25.76 9,28.12 8.86,23.14 3.88,23 6.24,18.61 2,16 6.24,13.39 3.88,9 8.86,8.86 9,3.88 13.39,6.24"
        fill="#EAB308"
      />
    </svg>
  );
}

// ── Reusable sidebar item ──────────────────────────────────────────────────────
function SidebarItem({
  id, label, active,
  onSelect, onDelete,
}: {
  id: string; label: string; active: boolean;
  onSelect: () => void; onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      role="button" tabIndex={0}
      className={["w-full text-left px-2.5 py-2 text-sm rounded-md flex items-center justify-between group transition-colors cursor-pointer",
        active ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent text-sidebar-foreground",
      ].join(" ")}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      data-testid={`sidebar-item-${id}`}
    >
      <span className="truncate text-xs">{label}</span>
      <button type="button" aria-label="Delete"
        className={["w-5 h-5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-colors shrink-0",
          active ? "text-primary-foreground hover:bg-primary-foreground/20" : "text-muted-foreground hover:text-destructive",
        ].join(" ")}
        onClick={onDelete}
        data-testid={`button-delete-${id}`}
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function Home() {
  const { state, dispatch } = useEditor();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rme-theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) { root.classList.add("dark"); localStorage.setItem("rme-theme", "dark"); }
    else          { root.classList.remove("dark"); localStorage.setItem("rme-theme", "light"); }
  }, [darkMode]);

  const categories: { id: Category; label: string; icon: any }[] = [
    { id: "borders",  label: "Borders",  icon: Box },
    { id: "grounds",  label: "Grounds",  icon: Layers },
    { id: "walls",    label: "Walls",    icon: BrickWall },
    { id: "doodads",  label: "Doodads",  icon: ImageIcon },
    { id: "tilesets", label: "Tilesets", icon: Database },
  ];

  // ── For non-doodad categories ──────────────────────────────────────────────
  const currentItems: { id: string; [key: string]: any }[] = (() => {
    switch (state.activeCategory) {
      case "borders":  return state.borders;
      case "grounds":  return state.grounds;
      case "walls":    return state.walls;
      case "tilesets": return state.tilesets ?? [];
      default:         return [];
    }
  })();

  const handleCreate = () => {
    const id = crypto.randomUUID();
    switch (state.activeCategory) {
      case "borders":
        dispatch({ type: "ADD_BORDER", border: { id, borderId: 0, items: { n: [], s: [], e: [], w: [], cnw: [], cne: [], csw: [], cse: [], dnw: [], dne: [], dsw: [], dse: [] } } });
        break;
      case "grounds":
        dispatch({ type: "ADD_GROUND", ground: { id, name: "New Ground", items: [], borders: [], friends: [] } });
        break;
      case "walls":
        dispatch({ type: "ADD_WALL", wall: { id, name: "New Wall", walls: {} } });
        break;
      case "tilesets":
        dispatch({ type: "ADD_TILESET", tileset: { id, name: "New Tileset", sections: [] } });
        break;
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (state.activeCategory) {
      case "borders":  dispatch({ type: "DELETE_BORDER",  id }); break;
      case "grounds":  dispatch({ type: "DELETE_GROUND",  id }); break;
      case "walls":    dispatch({ type: "DELETE_WALL",    id }); break;
      case "tilesets": dispatch({ type: "DELETE_TILESET", id }); break;
    }
  };

  const getItemLabel = (item: any) =>
    state.activeCategory === "borders" ? `Border ${item.borderId || "New"}` : item.name || "Unnamed";

  // ── Doodads + Carpets sidebar creators ────────────────────────────────────
  const handleCreateDoodad = () => {
    const id = crypto.randomUUID();
    dispatch({ type: "ADD_DOODAD", doodad: { id, name: "New Doodad", draggable: true, onBlocking: false, thickness: "10/100", elements: [] } });
  };
  const handleCreateCarpet = () => {
    const id = crypto.randomUUID();
    dispatch({ type: "ADD_CARPET", carpet: { id, name: "New Carpet", carpets: {} } });
  };
  const handleDeleteDoodad = (id: string, e: React.MouseEvent) => { e.stopPropagation(); dispatch({ type: "DELETE_DOODAD", id }); };
  const handleDeleteCarpet = (id: string, e: React.MouseEvent) => { e.stopPropagation(); dispatch({ type: "DELETE_CARPET", id }); };

  const isDoodadTab = state.activeCategory === "doodads";
  const totalDoodadTabCount = state.doodads.length + state.carpets.length;

  // ── Which sub-editor to show on the doodads tab ───────────────────────────
  const activeDoodad = isDoodadTab ? state.doodads.find((d) => d.id === state.activeItemId) : undefined;
  const activeCarpet = isDoodadTab ? state.carpets.find((c) => c.id === state.activeItemId) : undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* ── Header ── */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 shrink-0 gap-3">
        <div className="flex items-center gap-2 mr-4">
          <DodecagramIcon size={32} />
          <span className="font-bold tracking-tight text-sm whitespace-nowrap">Elewental Palette Editor</span>
        </div>

        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = state.activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`gap-2 shrink-0 ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}
                onClick={() => dispatch({ type: "SET_CATEGORY", category: cat.id })}
                data-testid={`tab-${cat.id}`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </Button>
            );
          })}
        </nav>

        <Button
          variant="ghost" size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setDarkMode((d) => !d)}
          data-testid="button-toggle-dark-mode"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside className={["border-r border-border bg-sidebar flex flex-col shrink-0 transition-all duration-200", sidebarOpen ? "w-60" : "w-10"].join(" ")}>
          {sidebarOpen ? (
            <>
              {/* ── Doodads tab: two sub-sections ── */}
              {isDoodadTab ? (
                <ScrollArea className="flex-1">
                  {/* Doodads sub-section */}
                  <div className="p-3 pb-1 flex items-center justify-between">
                    <h2 className="font-semibold text-sidebar-foreground text-sm">Doodads</h2>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={handleCreateDoodad}
                        className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        data-testid="button-create-doodad" title="New doodad">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setSidebarOpen(false)}
                        className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        data-testid="button-collapse-sidebar" title="Collapse sidebar">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="px-1.5 pb-1 space-y-0.5">
                    {state.doodads.map((item) => (
                      <SidebarItem
                        key={item.id} id={item.id}
                        label={item.name || "Unnamed"}
                        active={state.activeItemId === item.id}
                        onSelect={() => dispatch({ type: "SET_ACTIVE_ITEM", id: item.id })}
                        onDelete={(e) => handleDeleteDoodad(item.id, e)}
                      />
                    ))}
                    {state.doodads.length === 0 && (
                      <p className="text-center px-2 py-2 text-xs text-muted-foreground">No doodads yet.</p>
                    )}
                  </div>

                  {/* Carpets sub-section */}
                  <div className="p-3 pb-1 flex items-center justify-between border-t border-border/40 mt-2">
                    <h2 className="font-semibold text-sidebar-foreground text-sm">Carpets</h2>
                    <button type="button" onClick={handleCreateCarpet}
                      className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      data-testid="button-create-carpet" title="New carpet">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-1.5 pb-3 space-y-0.5">
                    {state.carpets.map((item) => (
                      <SidebarItem
                        key={item.id} id={item.id}
                        label={item.name || "Unnamed"}
                        active={state.activeItemId === item.id}
                        onSelect={() => dispatch({ type: "SET_ACTIVE_ITEM", id: item.id })}
                        onDelete={(e) => handleDeleteCarpet(item.id, e)}
                      />
                    ))}
                    {state.carpets.length === 0 && (
                      <p className="text-center px-2 py-2 text-xs text-muted-foreground">No carpets yet.</p>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                /* ── All other categories: single list ── */
                <>
                  <div className="p-3 border-b border-border flex items-center justify-between min-h-[48px]">
                    <h2 className="font-semibold text-sidebar-foreground capitalize text-sm">{state.activeCategory}</h2>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={handleCreate}
                        className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        data-testid="button-create-item" title="New item">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setSidebarOpen(false)}
                        className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        data-testid="button-collapse-sidebar" title="Collapse sidebar">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 p-1.5">
                    <div className="space-y-0.5">
                      {currentItems.map((item) => (
                        <SidebarItem
                          key={item.id} id={item.id}
                          label={getItemLabel(item)}
                          active={state.activeItemId === item.id}
                          onSelect={() => dispatch({ type: "SET_ACTIVE_ITEM", id: item.id })}
                          onDelete={(e) => handleDelete(item.id, e)}
                        />
                      ))}
                      {currentItems.length === 0 && (
                        <div className="text-center p-4 text-xs text-muted-foreground">
                          No items yet.<br />Click + to create one.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </>
          ) : (
            /* ── Collapsed sidebar ── */
            <div className="flex flex-col items-center pt-2 gap-2">
              <button type="button" onClick={() => setSidebarOpen(true)}
                className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                data-testid="button-expand-sidebar" title="Expand sidebar">
                <ChevronRight className="w-4 h-4" />
              </button>
              {(isDoodadTab ? totalDoodadTabCount : currentItems.length) > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  {isDoodadTab ? totalDoodadTabCount : currentItems.length}
                </span>
              )}
            </div>
          )}
        </aside>

        {/* ── Main Editor ── */}
        <main className="flex-1 overflow-y-auto bg-background">
          {state.activeCategory === "borders"  && <BorderEditor />}
          {state.activeCategory === "grounds"  && <GroundEditor />}
          {state.activeCategory === "walls"    && <WallEditor />}
          {state.activeCategory === "tilesets" && <TilesetEditor />}
          {isDoodadTab && (
            activeDoodad ? <DoodadEditor /> :
            activeCarpet ? <CarpetEditor /> : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Select a doodad or carpet from the sidebar, or create a new one.
              </div>
            )
          )}
        </main>

        {/* ── XML Preview ── */}
        <aside className="w-96 shrink-0">
          <XmlPreview />
        </aside>
      </div>
    </div>
  );
}
