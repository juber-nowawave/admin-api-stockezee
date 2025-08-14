import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";

export const create_user_role = async (req, res) => {
  try {
    const { role, view, add, edit, del } = req.body;
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

    if (!role || !view || !add || !edit || !del) {
      return api_response(res, 400, 0, "Missing info!", null);
    }

    const isRoleExist = await db.admin_user_roles.findOne({
      where: {
        role,
      },
    });

    if (isRoleExist) {
      return api_response(res, 401, 0, "Role already exist!", null);
    }

    await db.admin_user_roles.create({
      role,
      view,
      edit,
      add,
      delete:del,
    });

    return api_response(res, 200, 1, "Role created successfully!", null);
  } catch (error) {
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

    let all_roles = await db.admin_user_roles.findAll({});
    all_roles = all_roles.map((roles) => roles.role);
    return api_response(res, 200, 1, "Roles fetched succesfully", all_roles);
  } catch (error) {
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
