import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";

export const create_user_role = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
      return api_response(
        res,
        401,
        0,
        "Authorization token missing or malformed",
        null
      );
    }

    const token = header.split(" ")[1];
    const verify = await verify_token(token);

    if (!verify) {
      return api_response(res, 400, 0, "Invalid token!", null);
    }

    if (verify.role !== "Super Admin") {
      return api_response(res, 401, 0, "Unauthorized access!", null);
    }

    let { role, active, page_permission } = req.body;

    if (!role || !page_permission) {
      return api_response(res, 400, 0, "Missing info!", null);
    }

    if (page_permission.length === 0) {
      return api_response(
        res,
        400,
        0,
        "Please provide at least one page permission!",
        null
      );
    }

    if (typeof active !== "boolean") {
      await t.rollback();
      return api_response(res, 400, 0, "Active value should be boolean", null);
    }

    role = role.toLowerCase();
    const isRoleExist = await db.admin_roles.findOne({
      where: { title: role },
    });
    if (isRoleExist) {
      return api_response(res, 401, 0, "Role already exists!", null);
    }

    let permissions_map = {};
    let all_permissions = await db.admin_page_permission.findAll({});
    all_permissions.forEach((obj) => {
      permissions_map[obj.name] = obj.id;
    });

    const created_role = await db.admin_roles.create(
      {
        title: role,
        status: active,
      },
      { transaction: t }
    );

    const permissionRows = [];

    for (const obj of page_permission) {
      if (typeof obj.page_id != "number") {
        await t.rollback();
        return api_response(res, 400, 0, "Page id should be number!", null);
      }

      const page = await db.admin_pages.findOne({
        where: { id: obj.page_id, name: obj.module },
      });

      if (page) {
        if (obj.view) {
          permissionRows.push({
            role_id: created_role.id,
            page_id: obj.page_id,
            permission_id: permissions_map["view"],
          });
        }
        if (obj.add) {
          permissionRows.push({
            role_id: created_role.id,
            page_id: obj.page_id,
            permission_id: permissions_map["add"],
          });
        }
        if (obj.edit) {
          permissionRows.push({
            role_id: created_role.id,
            page_id: obj.page_id,
            permission_id: permissions_map["edit"],
          });
        }
        if (obj.del) {
          permissionRows.push({
            role_id: created_role.id,
            page_id: obj.page_id,
            permission_id: permissions_map["delete"],
          });
        }
      }
    }

    if (permissionRows.length > 0) {
      await db.admin_role_page_permission.bulkCreate(permissionRows, {
        transaction: t,
      });
    }

    await t.commit();

    return api_response(res, 200, 1, "Role created successfully!", null);
  } catch (error) {
    console.log("Error occurred during create admin role!", error);
    await t.rollback();
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const get_all_user_roles = async (req, res) => {
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
      return api_response(
        res,
        401,
        0,
        "Authorization token missing or malformed",
        null
      );
    }

    const token = header.split(" ")[1];
    const verify = await verify_token(token);

    if (!verify) {
      return api_response(res, 400, 0, "Invalid token!", null);
    }

    if (verify.role != "Super Admin") {
      return api_response(res, 401, 0, "unauthrized acess!", null);
    }

    let all_roles = await db.admin_roles.findAll({});

    all_roles = all_roles.map((roles) => {
      return {
        id: roles.id,
        role: roles.title,
        status: roles.status,
      };
    });
    return api_response(res, 200, 1, "Roles fetched succesfully", all_roles);
  } catch (error) {
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const remove_user_roles = async (req, res) => {
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
      return api_response(
        res,
        401,
        0,
        "Authorization token missing or malformed",
        null
      );
    }

    const token = header.split(" ")[1];
    const verify = await verify_token(token);

    if (!verify) {
      return api_response(res, 400, 0, "Invalid token!", null);
    }

    if (verify.role !== "Super Admin") {
      return api_response(res, 401, 0, "Unauthorized access!", null);
    }

    let { id } = req.body;

    if (typeof id != "number") {
      return api_response(res, 400, 0, "Id should be number!", null);
    }

    let removed_role = await db.admin_roles.destroy({ where: { id } });

    return api_response(res, 200, 1, "Role deleted succesfully", null);
  } catch (error) {
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const update_user_roles = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
      return api_response(
        res,
        401,
        0,
        "Authorization token missing or malformed",
        null
      );
    }

    const token = header.split(" ")[1];
    const verify = await verify_token(token);

    if (!verify) {
      return api_response(res, 400, 0, "Invalid token!", null);
    }

    if (verify.role !== "Super Admin") {
      return api_response(res, 401, 0, "Unauthorized access!", null);
    }
    let { role_id, active, page_permission } = req.body;

    if (!role_id || !page_permission) {
      await t.rollback();
      return api_response(res, 400, 0, "Missing info!", null);
    }

    await db.admin_roles.update(
      { status: active },
      { where: { id: role_id }, transaction: t }
    );

    if (!Array.isArray(page_permission) || page_permission.length === 0) {
      await t.rollback();
      return api_response(
        res,
        400,
        0,
        "Please provide at least one page permission!",
        null
      );
    }

    if (typeof active !== "boolean") {
      await t.rollback();
      return api_response(res, 400, 0, "Active value should be boolean", null);
    }

    const isRoleExist = await db.admin_roles.findOne({
      where: { id: role_id },
    });

    if (!isRoleExist) {
      await t.rollback();
      return api_response(res, 404, 0, "Role not exists!", null);
    }

    let permissions_map = {};
    let all_permissions = await db.admin_page_permission.findAll({});
    all_permissions.forEach((obj) => {
      permissions_map[obj.name.toLowerCase()] = obj.id;
    });

    await db.admin_role_page_permission.destroy({
      where: { role_id },
      transaction: t,
    });

    const permissionRows = [];

    for (const obj of page_permission) {
      if (typeof obj.page_id != "number") {
        await t.rollback();
        return api_response(res, 400, 0, "Page id should be number!", null);
      }

      const page = await db.admin_pages.findOne({
        where: { id: obj.page_id, name: obj.module },
      });

      if (page) {
        if (obj.view) {
          permissionRows.push({
            role_id: role_id,
            page_id: obj.page_id,
            permission_id: permissions_map["view"],
          });
        }
        if (obj.add) {
          permissionRows.push({
            role_id: role_id,
            page_id: obj.page_id,
            permission_id: permissions_map["add"],
          });
        }
        if (obj.edit) {
          permissionRows.push({
            role_id: role_id,
            page_id: obj.page_id,
            permission_id: permissions_map["edit"],
          });
        }
        if (obj.del) {
          permissionRows.push({
            role_id: role_id,
            page_id: obj.page_id,
            permission_id: permissions_map["delete"],
          });
        }
      }
    }

    if (permissionRows.length > 0) {
      await db.admin_role_page_permission.bulkCreate(permissionRows, {
        transaction: t,
      });
    }
    await t.commit();
    return api_response(res, 200, 1, "Role info updated successfully", null);
  } catch (error) {
    console.error("Error occurred during update role info!", error);
    await t.rollback();
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const get_specific_user_roles = async (req, res) => {
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
      return api_response(
        res,
        401,
        0,
        "Authorization token missing or malformed",
        null
      );
    }

    const token = header.split(" ")[1];
    const verify = await verify_token(token);

    if (!verify) {
      return api_response(res, 400, 0, "Invalid token!", null);
    }

    if (verify.role !== "Super Admin") {
      return api_response(res, 401, 0, "Unauthorized access!", null);
    }

    const { id } = req.query;

    if (!id) {
      return api_response(res, 400, 0, "Role ID is required", null);
    }

    // if (typeof id != "number") {
    //   return api_response(res, 400, 0, "Id should be number", null);
    // }

    const page_permission = await db.sequelize.query(
      `
      SELECT 
       ar.id AS role_id, 
       ar.title AS role_name, 
       ar.status AS active,
       ap.id AS page_id,
       ap.name AS page_name, 
       app.id AS permission_id,
       app.name AS permission,
         CASE 
          WHEN arpp.id IS NULL THEN false 
          ELSE true 
         END AS has_permission
       FROM admin_roles ar
      CROSS JOIN admin_pages ap
      CROSS JOIN admin_page_permission app
      LEFT JOIN admin_role_page_permission arpp 
       ON arpp.role_id = ar.id 
      AND arpp.page_id = ap.id 
      AND arpp.permission_id = app.id
      WHERE ar.id = :id 
    `,
      {
        replacements: { id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (page_permission.length == 0) {
      return api_response(res, 401, 0, "Pages not found!", null);
    }
    let role_id = page_permission[0].role_id;
    let role_name = page_permission[0].role_name;
    let is_active = page_permission[0].active;
    let page = page_permission[0].page_name;
    let page_obj = {
      page_id: page_permission[0].page_id,
      module: page,
    };

    let page_permission2 = [];
    page_permission.forEach((obj) => {
      if (obj.page_name != page) {
        page_permission2.push(page_obj);
        page_obj = {};
        page_obj["page_id"] = obj.page_id;
        page_obj["module"] = obj.page_name;
        page_obj[obj.permission] = obj.has_permission;
        page = obj.page_name;
      } else {
        page_obj[obj.permission] = obj.has_permission;
      }
    });

    const data = {
      role_id,
      role_name,
      active: is_active,
      permission: page_permission2,
    };

    return api_response(res, 200, 1, "Role info fetched successfully!", data);
  } catch (error) {
    console.error("Error occurred during edit admin user info!", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
