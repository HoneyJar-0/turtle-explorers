import Grid from '@mui/system/Unstable_Grid';
import Paper from '@mui/material/Paper';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import React, { useState } from 'react';
import { Turtle } from '../pages';
import Typography from '@mui/material/Typography';
import { hashCode } from './World';
import Color from 'color';
import { useStyles } from '../src/themes';
import theme from '../src/themes'
import { ThemeProvider } from '@mui/system';

const initialState = {
	mouseX: null,
	mouseY: null,
	slot: 0
};

interface InventoryProps {
	turtle: Turtle;
}

export default function Inventory({ turtle }: InventoryProps) {
	const [state, setState] = useState<{
		mouseX: null | number;
		mouseY: null | number;
		slot: number;
	}>(initialState);

	const handleClick = (event: React.MouseEvent<HTMLDivElement>, slot: number) => {
		event.preventDefault();
		setState({
			mouseX: event.clientX - 2,
			mouseY: event.clientY - 4,
			slot
		});
	};

	const handleClose = (amount: 'all' | 'half' | 'one') => {
		turtle.moveItems(state.slot, amount);
		setState(initialState);
	};

	let menuItems = [];
	if (state.slot === turtle.selectedSlot) {
		menuItems = [
			<MenuItem key={3} onClick={() => {
				turtle.equip('left'); setState({ ...initialState, slot: turtle.selectedSlot });
			}}>Equip Left</MenuItem>,
			<MenuItem key={4} onClick={() => {
				turtle.equip('right'); setState({ ...initialState, slot: turtle.selectedSlot });
			}}>Equip Right</MenuItem>
		];
	} else {
		menuItems = [
			<MenuItem key={0} onClick={() => handleClose('all')}>Move All</MenuItem>,
			<MenuItem key={1} onClick={() => handleClose('half')}>Move Half</MenuItem>,
			<MenuItem key={2} onClick={() => handleClose('one')}>Move One</MenuItem>
		];
	}

	return (
		<ThemeProvider theme={theme}>
			<Grid container spacing={1} className={useStyles.inventory} >
				<Menu
					keepMounted
					open={state.mouseY !== null}
					onClose={handleClose}
					anchorReference="anchorPosition"
					anchorPosition={
						state.mouseY !== null && state.mouseX !== null
							? { top: state.mouseY, left: state.mouseX }
							: undefined
					}
				>
					{menuItems}
				</Menu>
				{
					turtle.inventory.map((item, i) => (
						<Grid key={i} xs={3} className={useStyles.inventoryItem}>
							<Paper onContextMenu={(ev) => handleClick(ev, i + 1)} className={i + 1 === turtle.selectedSlot ? 'selected' : ''} style={{
								background: item ? Color({
									h: hashCode(item.name + ':' + item.damage) % 360,
									s: 60,
									l: 40
								}).toString() : undefined
							}} onClick={() => turtle.selectSlot(i + 1)}>
								{item &&
									<Tooltip title={item.name + ':' + item.damage}>
										<Typography align="center" variant="h4">{item.count}</Typography>
									</Tooltip>
								}
							</Paper>
						</Grid>
					))
				}
			</Grid>
		</ThemeProvider>
	);
}