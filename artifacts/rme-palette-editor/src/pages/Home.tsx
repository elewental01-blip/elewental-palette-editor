import { useEditor } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { BorderEditor } from "@/components/editors/BorderEditor";
import { GroundEditor } from "@/components/editors/GroundEditor";
import { DoodadEditor } from "@/components/editors/DoodadEditor";
import { WallEditor } from "@/components/editors/WallEditor";
import { XmlPreview } from "@/components/XmlPreview";
import { Layers, Image as ImageIcon, Box, BrickWall, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  const { state, dispatch } = useEditor();

  const categories = [
    { id: "borders", label: "Borders", icon: Box },
    { id: "grounds", label: "Grounds", icon: Layers },
    { id: "walls", label: "Walls", icon: BrickWall },
    { id: "doodads", label: "Doodads", icon: ImageIcon },
  ] as const;

  const currentItems = state[state.activeCategory];

  const handleCreate = () => {
    const id = crypto.randomUUID();
    switch (state.activeCategory) {
      case "borders":
        dispatch({
          type: "ADD_BORDER",
          border: { id, borderId: 0, items: { n: [], s: [], e: [], w: [], cnw: [], cne: [], csw: [], cse: [], dnw: [], dne: [], dsw: [], dse: [] } },
        });
        break;
      case "grounds":
        dispatch({
          type: "ADD_GROUND",
          ground: { id, name: "New Ground", items: [], borders: [], friends: [] },
        });
        break;
      case "doodads":
        dispatch({
          type: "ADD_DOODAD",
          doodad: { id, name: "New Doodad", draggable: true, onBlocking: false, thickness: "10/100", elements: [] },
        });
        break;
      case "walls":
        dispatch({
          type: "ADD_WALL",
          wall: { id, name: "New Wall", walls: {} },
        });
        break;
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (state.activeCategory) {
      case "borders":
        dispatch({ type: "DELETE_BORDER", id });
        break;
      case "grounds":
        dispatch({ type: "DELETE_GROUND", id });
        break;
      case "doodads":
        dispatch({ type: "DELETE_DOODAD", id });
        break;
      case "walls":
        dispatch({ type: "DELETE_WALL", id });
        break;
    }
  };

  const getItemLabel = (item: any) => {
    if (state.activeCategory === "borders") return `Border ${item.borderId || "New"}`;
    return item.name || "Unnamed";
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <header className="h-14 border-b border-border bg-card flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2 mr-8">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold font-mono">
            RME
          </div>
          <span className="font-bold tracking-tight">Palette Editor</span>
        </div>
        
        <nav className="flex items-center gap-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = state.activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "secondary" : "ghost"}
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
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sidebar-foreground capitalize">{state.activeCategory}</h2>
            <Button size="icon" variant="ghost" onClick={handleCreate} data-testid="button-create-item">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {currentItems.map((item) => (
                <button
                  key={item.id}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between group transition-colors ${
                    state.activeItemId === item.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  }`}
                  onClick={() => dispatch({ type: "SET_ACTIVE_ITEM", id: item.id })}
                  data-testid={`sidebar-item-${item.id}`}
                >
                  <span className="truncate">{getItemLabel(item)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={`w-6 h-6 opacity-0 group-hover:opacity-100 ${
                      state.activeItemId === item.id ? "text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" : "text-muted-foreground hover:text-destructive"
                    }`}
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </button>
              ))}
              
              {currentItems.length === 0 && (
                <div className="text-center p-4 text-sm text-muted-foreground">
                  No items created yet.<br/>
                  Click + to create one.
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 overflow-y-auto bg-background custom-scrollbar">
          {state.activeCategory === "borders" && <BorderEditor />}
          {state.activeCategory === "grounds" && <GroundEditor />}
          {state.activeCategory === "walls" && <WallEditor />}
          {state.activeCategory === "doodads" && <DoodadEditor />}
        </main>

        {/* Right XML Preview */}
        <aside className="w-96 shrink-0">
          <XmlPreview />
        </aside>
      </div>
    </div>
  );
}
