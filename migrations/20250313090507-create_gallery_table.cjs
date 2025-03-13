"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("gallery", {
            _id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            galleryname: {
                type: Sequelize.STRING,
                allowNull: false,
              },
              galleryurl: {
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
              gallerycover: {
                type: Sequelize.STRING,
                allowNull: true,
              },
            LastUpdated: {
                type: Sequelize.BIGINT,
                defaultValue: null,
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
        await queryInterface.dropTable("gallery");
    },
};
