"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("images", "gallery_category", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "gallery_category_table",
                key: "_id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("images", "gallery_category");
    },
};
