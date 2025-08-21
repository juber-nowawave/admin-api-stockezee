export default (sequelize, DataTypes) => {
  const admin_page_permission = sequelize.define(
    "admin_page_permission",
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
      tableName: "admin_page_permission",
      underscored: true,
      timestamps: false,
    }
  );
  
  return admin_page_permission;
};
