import "dotenv/config";
import moment from "moment";
import cluster from "cluster";
import {cpus} from "os";
import chalk from "chalk";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import greenlock from "greenlock";
import http from "http";
import spdy from "spdy";
import bodyParser from "body-parser";
import morgan from "morgan";
import mung from "express-mung";
import {CronJob} from "cron";
import {Mutex} from "async-mutex";

// Controllers and utilities
import {genericResponse} from "./controllers/base_controllers.js";
import router from "./routes/router.js";
// import ServerLog from "./models/server_log";
import ErrorLog from "./models/error_log.js";
import * as CONSTANTS from "./config/constants.js";
import {connectDB, runMigrations, syncModels} from "./config/db.js";
import * as ENV from "./config/environment.js";
import {getIp} from "./utils/ip.js";

moment.tz.setDefault("Asia/Kolkata");

const numOfCPUs = cpus().length;
let workers = [];
const isProd = process.env.PROD === "true";

if (cluster.isPrimary && isProd) {
    for (let i = 0; i < numOfCPUs; i++) {
        const worker = cluster.fork();
        workers.push(worker);

        worker.on("message", message => {
            console.info(message);
        });
    }

    let cronWorkerId = null;

    cluster.on("listening", worker => {
        console.info(`Worker ${worker.process.pid} is listening`);

        if (!cronWorkerId) {
            console.log(`Assigning worker ${worker.id} as cron worker`);
            cronWorkerId = worker.id;
            worker.send({cron: true});
        }
    });

    cluster.on("exit", (worker, code, signal) => {
        console.warn(
            `Worker ${worker.process.pid} exited with code: ${code}, signal: ${signal}`,
        );

        if (worker.id === cronWorkerId) {
            console.log("Cron worker has died...");
            cronWorkerId = null;
        }

        const indexToRemove = workers.findIndex(x => x.id === worker.id);
        if (indexToRemove > -1) workers.splice(indexToRemove, 1);

        console.info("Starting a new worker...");
        const newWorker = cluster.fork();
        workers.push(newWorker);

        newWorker.on("message", message => {
            console.info(message);
        });
    });
} else {
    console.info(`Worker ${process.pid} started`);

    const app = express();
    let httpServer = null;
    let httpsServer = null;

    // Security and CORS settings
    if (ENV.secure) {
        app.use(
            cors({
                origin:
                    ENV.environment === "master-pcb"
                        ? CONSTANTS.MASTER_ALLOWED_DOMAINS
                        : CONSTANTS.ALLOWED_DOMAINS,
                credentials: true,
                methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            }),
        );

        app.use(helmet());
        app.use((req, res, next) => {
            res.setHeader("pragma", "no-cache");
            res.setHeader("Expires", "0");
            res.setHeader("X-Frame-Options", "deny");
            res.setHeader(
                "Cache-Control",
                "no-store, no-cache, max-age=0, must-revalidate",
            );
            next();
        });
    } else {
        app.use(cors());
    }

    httpServer = http.createServer(app);

    chalk.enabled = true;
    chalk.level = 3;

    // Database connection and migration
    (async () => {
        await connectDB();
        await runMigrations();
        await syncModels();
    })();

    // Log request/response
    app.use(
        mung.json((body, req, res) => {
            if (!ENV.serverLog) return body;
            const requestBody = JSON.stringify(req.body);
            const responseBody = JSON.stringify(body);

            if (!res.locals) res.locals = {};
            res.locals.serverLogToCreate = {
                RequestBody: requestBody,
                ResponseBody: responseBody,
            };
            return body;
        }),
    );

    app.use(
        morgan((tokens, req, res) => {
            if (!ENV.serverLog) return;

            const serverLog = new ServerLog({
                Headers: JSON.stringify(req.headers),
                Method: req.method,
                Url: req.originalUrl,
                Address: getIp(req),
                RequestBody: res.locals?.serverLogToCreate?.RequestBody || "",
                ResponseBody: res.locals?.serverLogToCreate?.ResponseBody || "",
                ResponseTime: Number(tokens["response-time"](req, res)),
            });

            if (res.locals.isError) ErrorLog.create(serverLog);
            else ServerLog.create(serverLog);
        }),
    );

    app.use(bodyParser.json({limit: "50mb"}));
    app.use(bodyParser.urlencoded({extended: false, limit: "50mb"}));
    app.use(router());
    app.use(errorHandler);

    function errorHandler(err, req, res, next) {
        if (res.headersSent) return next(err);

        if (!res.locals) res.locals = {};
        res.locals.isError = true;

        const errors = err.name === "UIError" ? [err.message] : [];
        const statusCode =
            err.name === "UIError"
                ? err.statusCode
                : CONSTANTS.statusCodes.SERVER_ERROR;

        return genericResponse({
            res,
            result: null,
            exception: errors.length > 0 ? errors[0] : "",
            pagination: null,
            statusCode,
        });
    }

    if (ENV.httpsPort) {
        const tlsOptions = {
            version: "draft-11",
            server: ENV.certbotServer,
            webrootPath: "/tmp/acme-challenge",
            configDir: "~/.config/acme",
            email: "dilli4904@gmail.com",
            approveDomains: (opts, certs, cb) =>
                cb(null, {options: opts, certs}),
            agreeTos: (opts, agreeCb) => agreeCb(null, opts.tosUrl),
            debug: ENV.debug,
        };

        const le = greenlock.create(tlsOptions);
        httpsServer = spdy.createServer(le.tlsOptions, le.middleware(app));
        httpsServer.listen(ENV.httpsPort, () => {
            const indiaDate = new Date(new Date().getTime() + 5.5 * 3600000);
            console.log(
                `HTTPS server started at ${ENV.httpsPort} on ${indiaDate}`,
            );
        });
    }

    httpServer.listen(ENV.httpPort, () => {
        const indiaDate = new Date(new Date().getTime() + 5.5 * 3600000);
        console.log(`HTTP server started at ${ENV.httpPort} on ${indiaDate}`);
        serverStarted();
    });

    async function startCrons() {
        if (ENV.cronEnabled) {
            const olgprsUsersMutex = new Mutex();

            let olgprsUsersImportJob = new CronJob({
                cronTime: CONSTANTS.olgprsUsersCronScheduledTime,
                onTick() {
                    cronController.updateOlgprsUsers(olgprsUsersMutex);
                },
                start: false,
                timeZone: "Asia/Calcutta",
            });

            olgprsUsersImportJob.start();
        }
    }

    function serverStarted() {
        if (!isProd) {
            startCrons();
        }

        process.on("message", message => {
            if (message.cron === true) {
                startCrons();
            }
        });

        process.on("SIGINT", async () => {
            try {
                if (httpServer) await httpServer.close();
                if (httpsServer) await httpsServer.close();
                process.exit(0);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        });
    }
}
