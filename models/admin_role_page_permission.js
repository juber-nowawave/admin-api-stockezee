export default (sequelize, DataTypes) => {
  const admin_role_page_permission = sequelize.define(
    "admin_role_page_permission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "admin_roles",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      page_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "admin_pages",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "admin_page_permission",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      created_at: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "admin_role_page_permission",
      underscored: true,
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["role_id", "page_id", "permission_id"],
        },
      ],
    }
  );

  return admin_role_page_permission;
};
