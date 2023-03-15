import {debug} from "debug";

export const debugLogFactory = (channel: string) => {
	const loggers = {
		error: debug(`${channel}-stderr`),
		log: debug(channel)
	};
	loggers.log.log = console.log.bind(console); // set this namespace to log via console.log
	return loggers;
};

const execCallBackAwait = async (cb: () => any): Promise<any | Error | null> => {
	let error: Error | null = null;
	let result: any = null;
	try {
		result = cb();
		if (result instanceof Promise) {
			const promise = result;
			result = null;
			result = await promise;
		}
	} catch (err) {
		error = err instanceof Error ? err : new Error(`${err}`);
	}
	return result ?? error;
};

// Do graceful shutdown
const shutdownHandler = async (
	beforeExitCb?: () => any,
	doExitCb?: (error?: Error) => void
): Promise<void> => {
	console.log('graceful shutdown...');
	let error: Error | undefined;

	if (beforeExitCb) {
		const before = await execCallBackAwait(beforeExitCb);
		if (before instanceof Error) {
			error = before;
		}
	}

	if (doExitCb) {
		doExitCb(error);
		// Backup exit if shutdown does not respond
		setTimeout(() => {
			console.log('force exit with error, shutdown not responding');
			process.exit(1);
		}, 5000);
	}
	else {
		process.exit(error ? 1 : 0);
	}
};

// Register shutdown handlers for signals
export const registerShutdown = (
	processEvents: NodeJS.Signals[],
	beforeExitCb?: () => any,
	doExitCb?: (error?: Error) => void
) => {
	for (const evt of processEvents) {
		process.once(evt, () => {
			shutdownHandler(beforeExitCb, doExitCb).then(() => console.log('exit'));
		});
	}
};
