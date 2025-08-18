import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";

export const user_login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return api_response(res, 400, 0, "Missing parameter", null);
    }

    const user = await db.admin_users.findOne({ where: { email } });

    if (!user) {
      return api_response(res, 404, 0, "User does not exist!", null);
    }

    const isMatch = await decode_bcrypt(password, user.password_hash);
    if (!isMatch) {
      return api_response(res, 401, 0, "Invalid Password", null);
    }

    if (!user.status) {
      return api_response(res, 403, 0, "Account is inactive", null);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.user_role,
    };

    const token = await generate_token(payload);

    const role_permission = await db.admin_user_roles.findOne({
      where: {
        role: user.user_role,
      },
    });

    const data = {
      user_name: user.user_name,
      email: user.email,
      mobile_no: user.mobile_no,
      gender: user.gender,
      status: user.status,
      user_role: user.user_role,
      role_permission: {
        view: role_permission.view,
        add: role_permission.add,
        edit: role_permission.edit,
        delete: role_permission.delete,
      },
      token: token,
    };

    return api_response(res, 200, 1, "Welcome to Stockezee's admin panel!",
      data,
    );
  } catch (error) {
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
