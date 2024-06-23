import { JsonDB, Config } from 'node-json-db';
import { EventEmitter } from 'events';
import { Direction, Turtle } from './turtle';
import { TurtleInfo } from './types';
import * as conf from './resources/config.json'
import assert from 'assert';

export class Manager extends EventEmitter{
    private turtleDB:JsonDB; //stores turtle ids and the dimension, chunk, coordinates, and direction the turtles are in
    private dimensionDB:JsonDB; //stores chunkDB paths to a dimension

    private dirPath = "../databases/";
    
    constructor(){
        super();
        this.turtleDB = new JsonDB(new Config(`${this.dirPath}turtleDB.json`, true, true));
        this.dimensionDB = new JsonDB(new Config(`${this.dirPath}dimensionDB.json`, true, true));

        if(!this.turtleDB.exists("/turtles")) this.turtleDB.push("/turtles", {});
        if(!this.dimensionDB.exists("/dimensions")) this.dimensionDB.push("/dimensions",{});

        this.emit('update', this.getAllBlocks());
    }

    /**
     * Updates the turtleDB with info regarding the turtle
     * @param turtle turtle ID number
     * @param dimID dimension ID
     * @param chunkID chunk ID
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param d direction the turtle is facing. One of [NORTH, SOUTH, EAST, WEST]
     */
    public updateTurtleDB(turtID:string, dimID:string, x: number, y: number, z: number, d: Direction):void;
    public updateTurtleDB(turtle:Turtle, dimID:string, x: number, y: number, z: number, d: Direction):void;
    public updateTurtleDB(turtleOrID: Turtle|string, dimID:string, x: number, y: number, z: number, d: Direction):void {
        
        const chunkID = this.getChunkID(x,z);

        if(typeof turtleOrID === "string"){
            const turtleInfo:TurtleInfo = {
                name: "",
                dimension: dimID,
                chunk: chunkID,
                x: x,
                y: y,
                z: z,
                direction: d
            }
            this.turtleDB.push(`/turtles/${turtleOrID}`, turtleInfo); //!!! OVERWRITES
        }
        else{
            const turtleInfo:TurtleInfo = {
                name: turtleOrID.label,
                dimension: dimID,
                chunk: chunkID,
                x: x,
                y: y,
                z: z,
                direction: d
            }
            this.turtleDB.push(`/turtles/${turtleOrID.id}`, turtleInfo); //!!! OVERWRITES
        }
        
	}

    /**
     * Updates the dimension database with all discovered chunks
     * @param dimID name of the dimension we are investigating
     * @param chunkID chunkID for file referencing
     */
    public updateDimensionDB(dimID:string, chunkID:string){
        this.dimensionDB.push(`/dimensions/${dimID}`, chunkID, false); //Appends, does not overwrite
        
    }

    /**
     * loads a JsonDB for the specified chunk in the specified dimension
     * @param dimID name of the dimension the chunk is in
     * @param chunkID chunk file we are loading
     * @returns JsonDB instance
     */
    public getChunk(dimID:string, chunkID:string){
        const db = new JsonDB(new Config(`${this.dirPath}${dimID}/${chunkID}.json`, true, true));
        if(!db.exists("/blocks")){ //we just loaded a new chunk
            db.push("/blocks",{});
            this.updateDimensionDB(dimID, chunkID); //add it to the dimension database
        }
        return db;
    }

    /**
     * Returns the chunk ID of the chunk the turtle is in. Chunk indexing starts at 0_0
     * Chunk ID is determined by taking the coordinates and floor dividing by chunk size
     * @param x x coordinate
     * @param z z coordinate
     * @returns string <chunk index x>_<chunk index z>
     */
    public getChunkID(x:number, z:number){
        return `${Math.floor(x/conf.chunk_size)}_${Math.floor(z/conf.chunk_size)}`
    }





    /**
     * The following code was copied/pasted from Ottomated's original world.ts file.
     * Changes I made will be noted, but for the most part it remains the same.
     * 
     * Notes: 
     * - Comments and method docs were added by me for the sake of readability. Docs include my changes
     * - In general, all references to "/world" as a datapath have been changed to the correct value in the new system
     */




    /**
     * Returns information about a particular turtle
     * @param turtle Turtle instance
     * @returns turtleInfo instance | null if it doesnt exist
     * 
     * Notes: 
     * - modified function to use turtleInfo instances rather than tuples
     * - made the method public and async
     */
	public async getTurtle(turtle: Turtle): Promise<TurtleInfo | null>{
        try{
            const dataPath = `/turtles/${turtle.id}`;
            /**
             * To address poor documentation on node-json-db's end:
             * getData() eventually either returns a Promise<any>, or an error. By default, it will NOT create the data entry.
             * Therefore, we can handle both the promise and the error here to avoid pesky typing issues
             */
            let data:TurtleInfo = await this.turtleDB.getData(dataPath);
            return data;
        }
        catch(error){
            return null;
        }
	}

    /**
     * Updates the database to contain information regarding a block in a chunk
     * @param dimID dimension name the turtle is in, and by proxy, the chunk
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @param block data pertaining to the block the turtle is reporting
     * 
     * Notes:
     * - added dimID to the parameters
     * - included chunkID
     * - fixed references from just this.db to their respective databases
     * - made method public async
     * - removed void return statement for readability and to remove duplicate code
     * - fixed parameters in this.getAllBlocks to match new code
     */
	public async updateBlock(dimID:string, x: number, y: number, z: number, block: any) {
        let chunkID = this.getChunkID(x,z);
        let chunkDB = this.getChunk(dimID, chunkID);
		let dataPath = `/blocks/${x},${y},${z}`;
		if (block === 'No block to inspect') {
			if (await chunkDB.exists(dataPath)) {
				chunkDB.delete(dataPath);
			}
		}
        else{
		    chunkDB.push(dataPath, block);
        }
		this.emit('update', this.getAllBlocks(dimID, chunkID));
	}

    /**
     * Reports the block data at specific coordinates in a dimension.
     * @param dimID name of the dimension the block is located in
     * @param x x coordinate
     * @param y y coordinate
     * @param z z coordinate
     * @returns block data
     * 
     * Notes:
     * - made public
     * - added dimID to parameters
     * - added chunkID and chunkDB variables
     * - fixed reference from this.db to chunkDB
     */
	public getBlock(dimID:string, x: number, y: number, z: number): any {
        let chunkID = this.getChunkID(x, z);
        let chunkDB = this.getChunk(dimID, chunkID);
		return chunkDB.getData(`/blocks/${x},${y},${z}`);
	}

    /**
     * Reports ALL blocks within a specified chunk and dimension.
     * If no dimID or chunkID is given, this will default to DIM1 0_0 (Overworld, starting chunk)
     * @param dimID name of the dimension of the blocks
     * @param chunkID index of the chunk the blocks are in
     * @returns list[block data]
     * 
     * Notes:
     * - added dimID and chunkID to parameters
     * - added default handling and overload signitures
     */
    public getAllBlocks(): { [index: string]: any }; //Overload
    public getAllBlocks(dimID:string, chunkID:string): { [index: string]: any }; //Overload
	public getAllBlocks(dimID?:string, chunkID?:string): { [index: string]: any } {
        let chunkDB;
        if(!dimID || !chunkID){ //defaulting
            chunkDB = this.getChunk("DIM1", "0_0");
        }
        else{
            chunkDB = this.getChunk(dimID, chunkID);
        }
		return chunkDB.getData('/blocks');
	}
}