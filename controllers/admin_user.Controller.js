import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";

export const user_create = async (req, res) => {
  try {
    let {
      email,
      user_name,
      user_role,
      role_id,
      mobile_no,
      gender,
      status,
      password,
    } = req.body;

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

    const is_accessible = await db.sequelize.query(
      `
      select ar.id as role_id, ar.title from admin_roles ar 
      inner join admin_role_page_permission arpp on ar.id = arpp.role_id
      inner join admin_pages ap on arpp.page_id = ap.id
      inner join admin_page_permission app on arpp.permission_id = app.id
      where ar.id = :role_id and ap.name = 'admin_management' and app.name = 'add'
    `,
      {
        replacements: { role_id: verify.role_id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (is_accessible.length == 0) {
      return api_response(
        res,
        401,
        0,
        "Unauthorized access!, you don't have permission to create user",
        null
      );
    }

    if (
      !email ||
      !role_id ||
      !user_role ||
      !mobile_no ||
      !user_name ||
      !gender ||
      status == undefined ||
      !password
    ) {
      return api_response(res, 401, 0, "Missing info!", null);
    }

    email = email.toLowerCase();
    user_name = user_name.toLowerCase();
    gender = gender.toLowerCase();
    user_role = user_role.toLowerCase();
    
    const isEmailExist = await db.admin_users.findOne({
      where: {
        email,
      },
    });

    if (isEmailExist) {
      return api_response(res, 401, 0, "Email already used!", null);
    }

    if (!/^\d{10}$/.test(mobile_no)) {
      return api_response(
        res,
        200,
        0,
        "Please enter a valid 10-digit mobile number!",
        null
      );
    }

    const isMobileExist = await db.admin_users.findOne({
      where: {
        mobile_no,
      },
    });

    if (isMobileExist) {
      return api_response(res, 401, 0, "Mobile number already used!", null);
    }

    const isRoleExist = await db.admin_roles.findOne({
      where: {
        id: role_id,
        title: user_role,
      },
    });

    if (!isRoleExist) {
      return api_response(res, 401, 0, "Invalid Role!", null);
    }

    const hased_password = await encode_bcrypt(password);
    await db.admin_users.create({
      email,
      user_name,
      role_id,
      mobile_no,
      gender,
      status,
      password_hash: hased_password,
    });

    return api_response(res, 200, 1, "user created successfully!", null);
  } catch (error) {
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const all_users = async (req, res) => {
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

    const is_accessible = await db.sequelize.query(
      `
      select ar.id as role_id, ar.title from admin_roles ar 
      inner join admin_role_page_permission arpp on ar.id = arpp.role_id
      inner join admin_pages ap on arpp.page_id = ap.id
      inner join admin_page_permission app on arpp.permission_id = app.id
      where ar.id = :role_id and ap.name = 'admin_management' and app.name = 'view'
    `,
      {
        replacements: { role_id: verify.role_id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (is_accessible.length == 0) {
      return api_response(
        res,
        401,
        0,
        "Unauthorized access!, you do'nt have permission to view user info",
        null
      );
    }

    let all_users = await db.sequelize.query(
      `
      select au.id, au.user_name, ar.title as user_role, au.email, au.mobile_no, au.gender, au.status from admin_users au
      inner join admin_roles ar on ar.id = au.role_id
    `,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    return api_response(
      res,
      200,
      1,
      "Fetched all users successfully!",
      all_users
    );
  } catch (error) {
    console.log(error);

    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const remove_admin_user = async (req, res) => {
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

    const is_accessible = await db.sequelize.query(
      `
      select ar.id as role_id, ar.title from admin_roles ar 
      inner join admin_role_page_permission arpp on ar.id = arpp.role_id
      inner join admin_pages ap on arpp.page_id = ap.id
      inner join admin_page_permission app on arpp.permission_id = app.id
      where ar.id = :role_id and ap.name = 'admin_management' and app.name = 'delete'
    `,
      {
        replacements: { role_id: verify.role_id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (is_accessible.length == 0) {
      return api_response(
        res,
        401,
        0,
        "Unauthorized access!, you don't have permission to remove user",
        null
      );
    }

    let { id } = req.body;

    if (typeof id != "number") {
      return api_response(res, 400, 0, "Id should be number!", null);
    }

    const deleted = await db.admin_users.destroy({ where: { id } });

    if (!deleted) {
      return api_response(res, 404, 0, "Admin user not found", null);
    }

    return api_response(res, 200, 1, "Admin user deleted successfully", null);
  } catch (error) {
    console.error("Error occurred during delete admin user", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const update_admin_user = async (req, res) => {
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

    const is_accessible = await db.sequelize.query(
      `
      select ar.id as role_id, ar.title from admin_roles ar 
      inner join admin_role_page_permission arpp on ar.id = arpp.role_id
      inner join admin_pages ap on arpp.page_id = ap.id
      inner join admin_page_permission app on arpp.permission_id = app.id
      where ar.id = :role_id and ap.name = 'admin_management' and app.name = 'edit'
    `,
      {
        replacements: { role_id: verify.role_id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (is_accessible.length == 0) {
      return api_response(
        res,
        401,
        0,
        "Unauthorized access!, you do'nt have permission to update user info",
        null
      );
    }

    const { id, user_role, email, mobile_no, password_hash, ...rest } =
      req.body;

    if (!id) {
      return api_response(res, 400, 0, "User ID is required for update", null);
    }

    const user = await db.admin_users.findByPk(id);
    if (!user) {
      return api_response(res, 404, 0, "Admin user not found", null);
    }

    let role_id = user.role_id;
    if (user_role) {
      const role = await db.admin_roles.findOne({
        where: { title: user_role },
      });
      if (!role) {
        return api_response(res, 400, 0, "Invalid role provided", null);
      }
      role_id = role.id;
    }

    if (email) {
      const emailExists = await db.admin_users.findOne({
        where: { email, id: { [db.Sequelize.Op.ne]: id } },
      });
      if (emailExists) {
        return api_response(res, 400, 0, "Email already exists", null);
      }
    }

    if (password_hash) {
      return api_response(res, 400, 0, "Invalid request", null);
    }

    if (mobile_no) {
      const mobileExists = await db.admin_users.findOne({
        where: { mobile_no, id: { [db.Sequelize.Op.ne]: id } },
      });
      if (mobileExists) {
        return api_response(res, 400, 0, "Mobile number already exists", null);
      }
    }

    const updateData = {
      ...rest,
      role_id,
    };

    if (email) updateData.email = email;
    if (mobile_no) updateData.mobile_no = mobile_no;

    await db.admin_users.update(updateData, { where: { id } });

    return api_response(res, 200, 1, "Admin user updated successfully", null);
  } catch (error) {
    console.error("Error occurred during edit admin user info!", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const get_specific_admin_user = async (req, res) => {
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

    const is_accessible = await db.sequelize.query(
      `
      select ar.id as role_id, ar.title from admin_roles ar 
      inner join admin_role_page_permission arpp on ar.id = arpp.role_id
      inner join admin_pages ap on arpp.page_id = ap.id
      inner join admin_page_permission app on arpp.permission_id = app.id
      where ar.id = :role_id and ap.name = 'admin_management' and app.name = 'view'
    `,
      {
        replacements: { role_id: verify.role_id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (is_accessible.length == 0) {
      return api_response(
        res,
        401,
        0,
        "Unauthorized access!, you do'nt have permission to view user info",
        null
      );
    }

    const { id } = req.query;

    if (!id) {
      return api_response(res, 400, 0, "User ID is required", null);
    }

    const user = await db.admin_users.findOne({
      where: { id },
      attributes: { exclude: ["password_hash", "created_at"] },
    });

    if (!user) {
      return api_response(res, 404, 0, "Admin user not found", null);
    }

    const role = await db.admin_roles.findOne({
      where: { id: user.role_id },
    });

    if (!role) {
      return api_response(res, 400, 0, "Invalid role provided", null);
    }

    const userData = user.get({ plain: true });
    const data = {
      ...userData,
      user_role: role.title,
    };

    return api_response(
      res,
      200,
      1,
      "Admin user details fetched successfully",
      data
    );
  } catch (error) {
    console.error("Error occurred while fetching user details!", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
