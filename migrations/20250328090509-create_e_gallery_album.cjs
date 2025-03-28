"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("e_gallery", {
            _id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            drive_folder_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            userid: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                  model: 'Users',
                  key: '_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
              },
            album_cover: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            deletedAt: {
                type: Sequelize.DATE,
                defaultValue: null,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("e_gallery");
    },
};
