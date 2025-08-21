//admin_pages

export default (sequelize, DataTypes) => {
  const admin_pages = sequelize.define(
    "admin_pages",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      created_at: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "admin_pages",
      underscored: true,
      timestamps: false,
    }
  );

  return admin_pages;
};
