import { useState, useEffect } from "react";
import { useEditor } from "@/lib/context";
import { BorderEditor } from "@/components/editors/BorderEditor";
import { GroundEditor } from "@/components/editors/GroundEditor";
import { DoodadEditor } from "@/components/editors/DoodadEditor";
import { WallEditor } from "@/components/editors/WallEditor";
import { XmlPreview } from "@/components/XmlPreview";
import {
  Layers, Image as ImageIcon, Box, BrickWall,
  Plus, Trash2, ChevronLeft, ChevronRight, Moon, Sun,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { state, dispatch } = useEditor();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rme-theme") === "dark";
    }
    return false;
  });

  // Apply / remove .dark class on <html> whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("rme-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("rme-theme", "light");
    }
  }, [darkMode]);

  const categories = [
    { id: "borders", label: "Borders", icon: Box },
    { id: "grounds", label: "Grounds", icon: Layers },
    { id: "walls",   label: "Walls",   icon: BrickWall },
    { id: "doodads", label: "Doodads", icon: ImageIcon },
  ] as const;

  const currentItems = state[state.activeCategory];

  const handleCreate = () => {
    const id = crypto.randomUUID();
    switch (state.activeCategory) {
      case "borders":
        dispatch({
          type: "ADD_BORDER",
          border: {
            id, borderId: 0,
            items: { n: [], s: [], e: [], w: [], cnw: [], cne: [], csw: [], cse: [], dnw: [], dne: [], dsw: [], dse: [] },
          },
        });
        break;
      case "grounds":
        dispatch({ type: "ADD_GROUND", ground: { id, name: "New Ground", items: [], borders: [], friends: [] } });
        break;
      case "doodads":
        dispatch({ type: "ADD_DOODAD", doodad: { id, name: "New Doodad", draggable: true, onBlocking: false, thickness: "10/100", elements: [] } });
        break;
      case "walls":
        dispatch({ type: "ADD_WALL", wall: { id, name: "New Wall", walls: {} } });
        break;
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (state.activeCategory) {
      case "borders": dispatch({ type: "DELETE_BORDER", id }); break;
      case "grounds": dispatch({ type: "DELETE_GROUND", id }); break;
      case "doodads": dispatch({ type: "DELETE_DOODAD", id }); break;
      case "walls":   dispatch({ type: "DELETE_WALL",   id }); break;
    }
  };

  const getItemLabel = (item: any) =>
    state.activeCategory === "borders" ? `Border ${item.borderId || "New"}` : item.name || "Unnamed";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* ── Header ── */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 shrink-0 gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold font-mono text-xs">
            RME
          </div>
          <span className="font-bold tracking-tight text-sm">Palette Editor</span>
        </div>

        {/* Category tabs */}
        <nav className="flex items-center gap-1 flex-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = state.activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={`gap-2 ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}
                onClick={() => dispatch({ type: "SET_CATEGORY", category: cat.id })}
                data-testid={`tab-${cat.id}`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </Button>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setDarkMode((d) => !d)}
          data-testid="button-toggle-dark-mode"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside
          className={[
            "border-r border-border bg-sidebar flex flex-col shrink-0 transition-all duration-200 relative",
            sidebarOpen ? "w-60" : "w-10",
          ].join(" ")}
        >
          {sidebarOpen ? (
            <>
              {/* Sidebar header */}
              <div className="p-3 border-b border-border flex items-center justify-between min-h-[48px]">
                <h2 className="font-semibold text-sidebar-foreground capitalize text-sm">
                  {state.activeCategory}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    data-testid="button-create-item"
                    title="New item"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    data-testid="button-collapse-sidebar"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Item list */}
              <ScrollArea className="flex-1 p-1.5">
                <div className="space-y-0.5">
                  {currentItems.map((item) => (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      className={[
                        "w-full text-left px-2.5 py-2 text-sm rounded-md flex items-center justify-between group transition-colors cursor-pointer",
                        state.activeItemId === item.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-sidebar-accent text-sidebar-foreground",
                      ].join(" ")}
                      onClick={() => dispatch({ type: "SET_ACTIVE_ITEM", id: item.id })}
                      onKeyDown={(e) => e.key === "Enter" && dispatch({ type: "SET_ACTIVE_ITEM", id: item.id })}
                      data-testid={`sidebar-item-${item.id}`}
                    >
                      <span className="truncate text-xs">{getItemLabel(item)}</span>
                      <button
                        type="button"
                        aria-label="Delete"
                        className={[
                          "w-5 h-5 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-colors shrink-0",
                          state.activeItemId === item.id
                            ? "text-primary-foreground hover:bg-primary-foreground/20"
                            : "text-muted-foreground hover:text-destructive",
                        ].join(" ")}
                        onClick={(e) => handleDelete(item.id, e)}
                        data-testid={`button-delete-${item.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {currentItems.length === 0 && (
                    <div className="text-center p-4 text-xs text-muted-foreground">
                      No items yet.<br />Click + to create one.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            /* Collapsed sidebar — just an expand button */
            <div className="flex flex-col items-center pt-2 gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                data-testid="button-expand-sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {/* Item count badge */}
              {currentItems.length > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  {currentItems.length}
                </span>
              )}
            </div>
          )}
        </aside>

        {/* ── Main Editor Area ── */}
        <main className="flex-1 overflow-y-auto bg-background">
          {state.activeCategory === "borders" && <BorderEditor />}
          {state.activeCategory === "grounds" && <GroundEditor />}
          {state.activeCategory === "walls"   && <WallEditor />}
          {state.activeCategory === "doodads" && <DoodadEditor />}
        </main>

        {/* ── Right XML Preview ── */}
        <aside className="w-96 shrink-0">
          <XmlPreview />
        </aside>
      </div>
    </div>
  );
}
