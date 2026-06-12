import { createContext, useContext, useReducer, ReactNode } from "react";
import { BorderItem, GroundItem, DoodadItem, WallItem, CarpetItem } from "./types";

type Category = "borders" | "grounds" | "doodads" | "carpets" | "walls";

type State = {
  borders: BorderItem[];
  grounds: GroundItem[];
  doodads: DoodadItem[];
  carpets: CarpetItem[];
  walls: WallItem[];
  activeCategory: Category;
  activeItemId: string | null;
};

type Action =
  | { type: "SET_CATEGORY"; category: Category }
  | { type: "SET_ACTIVE_ITEM"; id: string | null }
  | { type: "ADD_BORDER"; border: BorderItem }
  | { type: "UPDATE_BORDER"; id: string; border: BorderItem }
  | { type: "DELETE_BORDER"; id: string }
  | { type: "ADD_GROUND"; ground: GroundItem }
  | { type: "UPDATE_GROUND"; id: string; ground: GroundItem }
  | { type: "DELETE_GROUND"; id: string }
  | { type: "ADD_DOODAD"; doodad: DoodadItem }
  | { type: "UPDATE_DOODAD"; id: string; doodad: DoodadItem }
  | { type: "DELETE_DOODAD"; id: string }
  | { type: "ADD_CARPET"; carpet: CarpetItem }
  | { type: "UPDATE_CARPET"; id: string; carpet: CarpetItem }
  | { type: "DELETE_CARPET"; id: string }
  | { type: "ADD_WALL"; wall: WallItem }
  | { type: "UPDATE_WALL"; id: string; wall: WallItem }
  | { type: "DELETE_WALL"; id: string }
  | { type: "CLEAR_CATEGORY"; category: Category };

const initialState: State = {
  borders:  [],
  grounds:  [],
  doodads:  [],
  carpets:  [],
  walls:    [],
  activeCategory: "borders",
  activeItemId: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CATEGORY":
      return { ...state, activeCategory: action.category, activeItemId: null };
    case "SET_ACTIVE_ITEM":
      return { ...state, activeItemId: action.id };

    case "ADD_BORDER":
      return { ...state, borders: [...state.borders, action.border], activeItemId: action.border.id };
    case "UPDATE_BORDER":
      return { ...state, borders: state.borders.map((b) => (b.id === action.id ? action.border : b)) };
    case "DELETE_BORDER":
      return { ...state, borders: state.borders.filter((b) => b.id !== action.id), activeItemId: state.activeItemId === action.id ? null : state.activeItemId };

    case "ADD_GROUND":
      return { ...state, grounds: [...state.grounds, action.ground], activeItemId: action.ground.id };
    case "UPDATE_GROUND":
      return { ...state, grounds: state.grounds.map((g) => (g.id === action.id ? action.ground : g)) };
    case "DELETE_GROUND":
      return { ...state, grounds: state.grounds.filter((g) => g.id !== action.id), activeItemId: state.activeItemId === action.id ? null : state.activeItemId };

    case "ADD_DOODAD":
      return { ...state, doodads: [...state.doodads, action.doodad], activeItemId: action.doodad.id };
    case "UPDATE_DOODAD":
      return { ...state, doodads: state.doodads.map((d) => (d.id === action.id ? action.doodad : d)) };
    case "DELETE_DOODAD":
      return { ...state, doodads: state.doodads.filter((d) => d.id !== action.id), activeItemId: state.activeItemId === action.id ? null : state.activeItemId };

    case "ADD_CARPET":
      return { ...state, carpets: [...state.carpets, action.carpet], activeItemId: action.carpet.id };
    case "UPDATE_CARPET":
      return { ...state, carpets: state.carpets.map((c) => (c.id === action.id ? action.carpet : c)) };
    case "DELETE_CARPET":
      return { ...state, carpets: state.carpets.filter((c) => c.id !== action.id), activeItemId: state.activeItemId === action.id ? null : state.activeItemId };

    case "ADD_WALL":
      return { ...state, walls: [...state.walls, action.wall], activeItemId: action.wall.id };
    case "UPDATE_WALL":
      return { ...state, walls: state.walls.map((w) => (w.id === action.id ? action.wall : w)) };
    case "DELETE_WALL":
      return { ...state, walls: state.walls.filter((w) => w.id !== action.id), activeItemId: state.activeItemId === action.id ? null : state.activeItemId };

    case "CLEAR_CATEGORY":
      return { ...state, [action.category]: [], activeItemId: null };

    default:
      return state;
  }
}

const EditorContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within an EditorProvider");
  return context;
}
