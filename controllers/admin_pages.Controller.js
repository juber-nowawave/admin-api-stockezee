import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";

export const get_all_admin_pages = async (req, res) => {
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

    let all_pages = await db.admin_pages.findAll({});
    let all_permissions = await db.admin_page_permission.findAll({});
    let permissions = {};
    all_permissions.forEach(obj => {
        permissions[obj.name] = false;
    });
    
    all_pages = all_pages.map((page) => {
        return {
            module: page.name,
            ...permissions,
        };
    });
    
    return api_response(res, 200, 1, "Pages fetched succesfully", all_pages);
  } catch (error) {
    console.error('Error occured during fetched all pages!',error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
