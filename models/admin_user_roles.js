export default (sequelize, DataTypes) => {
  const admin_user_roles = sequelize.define(
    "admin_user_roles",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      view: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      add: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      edit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      delete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "admin_user_roles",
      underscored: true,
      timestamps: false,
    }
  );

  // admin_user_roles.sync({alter:true});
  return admin_user_roles;
};
