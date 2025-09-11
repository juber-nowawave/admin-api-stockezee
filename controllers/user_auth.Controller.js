import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import db from "../models/index.js";

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
      return api_response(res, 403, 0, "status is inactive", null);
    }

    let page_permission = await db.sequelize.query(
      `select a_ro.title as user_role , ap.name as pages, app.name as page_permission from admin_users au 
        inner join admin_role_page_permission ar on au.role_id = ar.role_id
        inner join admin_pages ap on ap.id = ar.page_id
        inner join admin_page_permission app on app.id = ar.permission_id
        inner join admin_roles a_ro on a_ro.id = ar.role_id
        where au.role_id = :role_id
    `,
      {
        replacements: { role_id: user.role_id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (page_permission.length == 0) {
      return api_response(res, 401, 0, "Pages not found!", null);
    }

    let user_role = page_permission[0].user_role;
    let page = page_permission[0].pages;
    let page_obj = {
      module: page,
    };
    let page_permission2 = [];
    page_permission = page_permission.forEach((obj) => {   
      if (obj.pages != page) {
        page_permission2.push(page_obj);
        page_obj = {};
        page_obj["module"] = obj.pages;
        page_obj[obj.page_permission] = true;
        page = obj.pages;
      } else {
        page_obj[obj.page_permission] = true;
      }
    });

    page_permission2.push(page_obj);

    const payload = {
      id: user.id,
      email: user.email,
      role: user_role,
      role_id: user.role_id,
    };

    const token = await generate_token(payload);

    const data = {
      user_name: user.user_name,
      email: user.email,
      mobile_no: user.mobile_no,
      gender: user.gender,
      status: user.status,
      user_role: user_role,
      page_permission: page_permission2,
      token: token,
    };

    return api_response(
      res,
      200,
      1,
      "Welcome to Stockezee's admin panel!",
      data
    );
  } catch (error) {
    console.error("Error occured during admin login!", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const reset_pass = async (req, res) => {
  try {
    const header = req.headers["authorization"];
    if (!header || !header.startsWith("Bearer ")) {
      return api_response(res, 401, 0, "Authorization token missing or malformed", null);
    }

    const token = header.split(" ")[1];
    const verify = await verify_token(token);
    if (!verify) {
      return api_response(res, 400, 0, "Invalid token!", null);
    }

    const { password } = req.body;
    if (!password) {
      return api_response(res, 400, 0, "Missing parameter", null);
    }

    const email = verify.email;
    const user = await db.admin_users.findOne({ where: { email } });

    if (!user) {
      return api_response(res, 404, 0, "User does not exist!", null);
    }

    const hash_pass = await encode_bcrypt(password);

    await db.admin_users.update(
      { password_hash: hash_pass },
      { where: { email } }
    );

    return api_response(res, 200, 1, "Password changed successfully!", null);
  } catch (error) {
    console.error("Error occurred during change password!", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
