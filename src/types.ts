import { Direction } from "./turtle";

export type DataEntry = {
    [coords:string] : Metadata;
}

export type Metadata = {
    name: String;
    state: String;
    tags: String;
}

export type TurtleInfo = null | {
    name: string,
    dimension: string,
    chunk: string,
    x: number,
    y: number,
    z: number,
    direction: Direction
}