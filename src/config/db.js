import { Sequelize } from 'sequelize';
import Umzug from 'umzug';
import logger from '../utils/logger.js';
import { databaseUrl } from './environment.js'; // Ensure correct path and file extension
import path from 'path'; // Import path module

const options = {
    pool: {
        max: 50,
        min: 0,
        idle: 10000,
    },
    define: {
        timestamps: true,
        freezeTableName: true,
    },
    logging: false,
};

const sequelize = new Sequelize(databaseUrl, options);

// Correct the migration path
const umzug = new Umzug({
    migrations: {
        // Use path.resolve to create an absolute path to the migrations folder
        path: path.resolve('./migrations'),
        params: [sequelize.getQueryInterface()],
    },
    storage: 'sequelize',
    storageOptions: {
        sequelize,
    },
});

async function connectDB() {
    try {
        await sequelize.authenticate();
        logger('Connection has been established successfully.', 'i');
    } catch (error) {
        logger(`Unable to connect to the database: ${error}`, 'e');
    }
}

async function runMigrations() {
    try {
        await umzug.up();
        logger('Migrations complete!', 'i');
    } catch (error) {
        logger(`Error running migrations: ${error}`, 'e');
    }
}

async function revertMigrations() {
    try {
        await umzug.down();
        logger('Migrations reverted!', 'i');
    } catch (error) {
        logger(`Error running migrations: ${error}`, 'e');
    }
}

// Ensure that DECIMAL parsing is handled correctly
Sequelize.DataTypes.DECIMAL.parse = function(value) {
    return parseFloat(value);
};

async function syncModels() {
    try {
        await sequelize.sync();
        logger('Tables Created!','i');
    } catch (err) {
        logger('Error syncing database:', err);
    }
}

export { sequelize, connectDB, runMigrations, revertMigrations, umzug,syncModels };
