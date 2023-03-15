import Koa from "koa";
import logger from "koa-logger";
import Router from "@koa/router";

import { debugLogFactory, registerShutdown } from "./utils";

const {error, log} = debugLogFactory('migration-manager:server');

const app = new Koa();
const router = new Router();

// Routes
router.get("/", async (ctx, next) => {
	ctx.body = {msg: "2pdf-service running"};
	await next();
});

// Middlewares
app.use(logger());
app.use(router.routes()).use(router.allowedMethods());

// Start server
const server = app.listen(80, () => {
	log("Koa started");
});

const shutdownKoa = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		server.close((err) => {
			log('Koa closed');
			if (err) {
				error(err);
				return reject(err);
			}
			return resolve();
		});
	});
};

registerShutdown(['SIGINT', 'SIGTERM'], shutdownKoa);
registerShutdown(['SIGUSR2'], shutdownKoa , () => {
	process.exit();
});
