import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";

export const create_user_role = async (req, res) => {
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

    const { role, active, page_permission } = req.body;

    if (
      role == undefined ||
      page_permission == undefined ||
      active == undefined
    ) {
      return api_response(res, 400, 0, "Missing info!", null);
    }

    if (page_permission.length == 0) {
      return api_response(
        res,
        400,
        0,
        "Please provide at-least one page permission!",
        null
      );
    }

    const isRoleExist = await db.admin_roles.findOne({
      where: {
        title: role,
      },
    });

    if (isRoleExist) {
      return api_response(res, 401, 0, "Role already exist!", null);
    }

    let permissions_map = {};
    let all_permissions = await db.admin_page_permission.findAll({});
    all_permissions.forEach(obj => {
      permissions_map[obj.name] = obj.id
    });

    const created_role = await db.admin_roles.create({
      title: role,
      status: true,
    });

    const permissionRows = [];

    for (const obj of page_permission) {
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
      await db.admin_role_page_permission.bulkCreate(permissionRows);
    }

    return api_response(res, 200, 1, "Role created successfully!", {
      role: created_role,
      permissions: permissionRows,
    });
  } catch (error) {
    console.log("Error occured during create admin role!", error);

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
        status:roles.status
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
    id = Number(id);

    let removed_role =  await db.admin_roles.destroy({ where: { id } });

    return api_response(res, 200, 1, "Role deleted succesfully", null);
  } catch (error) {
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
