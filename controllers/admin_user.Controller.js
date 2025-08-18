import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";

export const user_create = async (req, res) => {
  try {
    const { email, user_name, user_role, mobile_no, gender, status, password } =
      req.body;

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

    if (
      !email ||
      !user_role ||
      !mobile_no ||
      !user_name ||
      !gender ||
      !status ||
      !password
    ) {
      return api_response(res, 401, 0, "Missing info!", null);
    }

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

    const isRoleExist = await db.admin_user_roles.findOne({
      where: {
        role: user_role,
      },
    });

    if (!isRoleExist) {
      return api_response(res, 401, 0, "Invalid Role!", null);
    }

    const hased_password = await encode_bcrypt(password);
    await db.admin_users.create({
      email,
      user_name,
      user_role,
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

    if (verify.role != "Super Admin") {
      return api_response(res, 401, 0, "unauthrized acess!", null);
    }

    let all_users = await db.admin_users.findAll({
      attributes: { exclude: ["password_hash", "created_at"] },
    });

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
