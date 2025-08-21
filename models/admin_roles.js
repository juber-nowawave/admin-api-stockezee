export default (sequelize, DataTypes) => {
  const admin_roles = sequelize.define(
    "admin_roles",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        default:true
      },
      created_at: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "admin_roles",
      underscored: true,
      timestamps: false,
    }
  );

  return admin_roles;
};
