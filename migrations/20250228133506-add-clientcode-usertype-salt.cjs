"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('Users', 'clientcode', {
            type: Sequelize.STRING,
            allowNull: true,  // Optional (adjust based on your requirement)
        });

        await queryInterface.addColumn('Users', 'usertype', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'user',  // Default to 'user', or set it as needed
        });

        await queryInterface.addColumn('Users', 'salt', {
            type: Sequelize.STRING,
            allowNull: false,  // Salt is required for password hashing
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('Users', 'clientcode');
        await queryInterface.removeColumn('Users', 'usertype');
        await queryInterface.removeColumn('Users', 'salt');
    }
};
