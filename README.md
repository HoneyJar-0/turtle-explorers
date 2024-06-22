# About
This project is a fork from Ottomated's Turtle-Gambit project. 

The key difference between the original repo and this one is the intended use of the turtles. The code found in this repo is designed to allow for remote exploration utilizing turtles within a minecraft world.

## Intended Use Cases:
- exploring dungeons you aren't equipped for
- mapping out enemy bases
- trolling friends
- mapping hazardous terrain (modded environments that damage players, like acid rain or ambient radiation)

# How To Use
## The config.json file
Located in /src/resources, this file contains important values that allow for more niche customization for the turtles
- naming-scheme: refers to what set of names to use in /src/resources/names.json. You can use "all" as a value to use all naming schemes
- generalize-modded-blocks: whether or not to parse the strings of block tags to generalize them. i.e. all stones will render as a shaded stone block, all dirts will render as a shaded dirt block, etc.
	- allowed values: true, false
- constant-moving: whether or not the turtle should always be moving. This is intended to help prevent against other players mining the turtle.
	- not recommended unless absolutely necessary due to the fuel costs