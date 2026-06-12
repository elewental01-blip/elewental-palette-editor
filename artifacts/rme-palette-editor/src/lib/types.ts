export type BorderDirection = "n" | "s" | "e" | "w" | "cnw" | "cne" | "csw" | "cse" | "dnw" | "dne" | "dsw" | "dse";

export interface BorderItem {
  id: string;
  borderId: number;
  group?: number;
  comment?: string;
  items: Record<BorderDirection, number[]>;
}

export interface GroundItem {
  id: string;
  name: string;
  serverLookId?: number;
  zOrder?: number;
  items: { id: number; chance: number; }[];
  borders: { align: "outer" | "inner"; id: number; to?: string; }[];
  friends: string[];
}

export type DoodadElementType =
  | { type: "simple"; id: number; chance: number; alternate?: boolean; }
  | { type: "composite"; chance: number; tiles: { x: number; y: number; itemId: number }[]; alternate?: boolean; }
  | { type: "alternate"; items: { id: number; chance: number; }[]; };

export interface DoodadItem {
  id: string;
  name: string;
  serverLookId?: number;
  draggable: boolean;
  onBlocking: boolean;
  thickness: string;
  elements: DoodadElementType[];
}

export interface WallDoor {
  id: number;
  type: "normal" | "locked" | "quest" | "magic" | "archway" | "normal_alt" | "hatch_window" | "window";
  open?: boolean;
  locked?: boolean;
}

export interface WallTypeData {
  items: { id: number; chance: number; }[];
  doors: WallDoor[];
}

export interface WallItem {
  id: string;
  name: string;
  serverLookId?: number;
  draggable?: boolean;
  onBlocking?: boolean;
  thickness?: string;
  walls: {
    horizontal?: WallTypeData;
    vertical?: WallTypeData;
    corner?: WallTypeData;
    pole?: WallTypeData;
  };
  alternate?: { id: number; chance: number; }[];
  friends?: { name: string; redirect?: boolean; }[];
}

export interface EditorState {
  borders: BorderItem[];
  grounds: GroundItem[];
  doodads: DoodadItem[];
  walls: WallItem[];
}
