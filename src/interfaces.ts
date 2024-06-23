import * as names from './resources/names.json'

export interface Config{
	naming_scheme: keyof typeof names;
	generalize_modded_blocks: boolean;
	constant_moving: boolean;
	chunk_size: number;
}

