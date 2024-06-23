import { Server } from 'ws';
import { App, launch } from 'carlo';
import { resolve } from 'path';
import { Turtle } from './turtle';
import Queue from 'p-queue';
import { Manager } from './manager'

const wss = new Server({ port: 5757 });

let app: App;
let turtles: { [id: number]: Turtle } = {};

const manager = new Manager();

const queue = new Queue({ concurrency: 1 });
const turtleAddQueue = new Queue({ concurrency: 1 });
turtleAddQueue.pause();

(async () => {
	app = await launch();
	app.on('exit', () => process.exit());
	app.serveFolder(resolve(process.cwd(), "frontend/out"));

	app.exposeFunction('exec', async (index: number, func: string, ...args: any[]) => {
		if (typeof index === 'string') {
			[index, func, ...args] = JSON.parse(index).args;
		}
		return await queue.add(() => ((turtles[index] as any)[func])(...args));
	});

	app.exposeFunction('refreshData', async () => {
		await app.evaluate(`if (window.setWorld) window.setWorld(${JSON.stringify(manager.getAllBlocks())})`);
		await app.evaluate(`if (window.setTurtles) window.setTurtles(${serializeTurtles()})`);
	})

	await app.load('http://localhost:3000');
	manager.on('update', async (world) => {
		await app.evaluate(`if (window.setWorld) window.setWorld(${JSON.stringify(world)})`);
	});
	turtleAddQueue.start();

})();
wss.on('connection', async function connection(ws) {
	await turtleAddQueue.add(() => {
		let turtle = new Turtle(ws, manager);
		turtle.on('init', async () => {
			turtles[turtle.id] = turtle;
			turtle.on('update', () => app.evaluate(`if (window.setTurtles) window.setTurtles(${serializeTurtles()})`));
			await app.evaluate(`if (window.setTurtles) window.setTurtles(${serializeTurtles()})`)
			await app.evaluate(`if (window.setWorld) window.setWorld(${JSON.stringify(manager.getAllBlocks())})`);
			ws.on('close', async () => {
				delete turtles[turtle.id];
				await app.evaluate(`if (window.setTurtles) window.setTurtles(${serializeTurtles()})`)
			});
		});
	});
});

function serializeTurtles() {
	return JSON.stringify(Object.values(turtles));
}