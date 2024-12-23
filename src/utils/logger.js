import chalk from 'chalk';
import * as ENV from '../config/environment.js'; // Ensure correct path and file extension
import { getCurrentDateTime } from '../controllers/base_controllers.js'; // Ensure correct path and file extension

const logger = function logger(msg, type = 'e') {
    if (!ENV.debug) {
        // DO NOT print logs in production
        return;
    }

    const time = getCurrentDateTime().toLocaleTimeString();
    switch (type) {
        case 'l':
            console.log(`${chalk.grey(`${time} - `)}${chalk.blue(msg)}`);
            break;
        case 'e':
            console.log(`${chalk.grey(`${time} - `)}${chalk.red(msg)}`);
            break;
        case 'i':
            console.log(`${chalk.grey(`${time} - `)}${chalk.green(msg)}`);
            break;
        default:
            console.log(`${chalk.grey(`${time} - `)}${chalk.blue(msg)}`);
    }
};

export default logger;
