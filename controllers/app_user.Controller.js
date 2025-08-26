import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";
import { types } from "pg";

export const get_all_user = async (req, res) => {
  try {
    const { page_number, page_size, search_keyword, order_by, order_dir } =
      req.query;

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
      where ar.id = :role_id and ap.name = 'user_management' and app.name = 'view'
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
        "Unauthorized access!, you don't have permission to view users",
        null
      );
    }

    if (!page_number || !page_size || !order_by || !order_dir) {
      return api_response(res, 401, 0, "Missing parameters!", null);
    }

    let data;
    const offset_value = Number(page_size) * (Number(page_number) - 1);
    const valid_dirs = ["asc", "desc"];

    if (!valid_dirs.includes(order_dir.toLowerCase())) {
      return api_response(res, 400, 0, "Invalid order_dir value", null);
    }

    const [total_records] = await db.sequelize.query(
      `select count(id) from app_users`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (search_keyword.trim() != "") {
      data = await db.sequelize.query(
        `
        select * from 
        (select * from app_users where user_name like '%${search_keyword}%' order by id asc limit :page_size offset :offset_value)
        order by ${order_by} ${order_dir};    
      `,
        {
          replacements: {
            page_size: Number(page_size),
            search_keyword: search_keyword.trim(),
            offset_value,
          },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );
    } else {
      data = await db.sequelize.query(
        `
        select * from 
        (select * from app_users order by id asc limit :page_size offset :offset_value) 
        order by ${order_by} ${order_dir};    
      `,
        {
          replacements: {
            page_size: Number(page_size),
            offset_value,
          },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );
    }
    const response = {
      total_items: total_records.count,
      page_number: page_number,
      page_size: page_size,
      items: data,
    };
    return api_response(
      res,
      200,
      1,
      "user data fetched successfully!",
      response
    );
  } catch (error) {
    console.error('Error occured during fetched app users',error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const get_all_orders = async (req, res) => {
  try {
    const { page_number, page_size, search_keyword, order_by, order_dir } =
      req.query;

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
      where ar.id = :role_id and ap.name = 'order_management' and app.name = 'view'
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
        "Unauthorized access!, you don't have permission to view orders",
        null
      );
    }

    if (!page_number || !page_size || !order_by || !order_dir) {
      return api_response(res, 401, 0, "Missing parameters!", null);
    }

    let data;
    const offset_value = Number(page_size) * (Number(page_number) - 1);
    const valid_dirs = ["asc", "desc"];

    if (!valid_dirs.includes(order_dir.toLowerCase())) {
      return api_response(res, 400, 0, "Invalid order_dir value", null);
    }

    const [total_records] = await db.sequelize.query(
      `select count(id) from prime_subscriptions`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    if (search_keyword.trim() != "") {
      data = await db.sequelize.query(
        `
        select * from
        (select au.id as user_id, au.user_name, au.email, au.mobile_no, po.order_id, po.promo_code, po.original_price, po.discount, po.final_price, po.payment_order_id, po.payment_status,     
        po.payment_method, po.payment_txn_id, po.created_at, ps.start_date, ps.end_date, ps.is_active from prime_subscriptions ps
        inner join prime_orders po using(order_id)
        inner join app_users au on au.id = po.user_id
        where au.user_name like '%${search_keyword}%'
        order by user_id asc limit :page_size offset :offset_value)
        order by ${order_by} ${order_dir};
      `,
        {
          replacements: {
            page_size: Number(page_size),
            search_keyword: search_keyword.trim(),
            offset_value,
          },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );
    } else {
      data = await db.sequelize.query(
        `
        select * from
        (select au.id as user_id, au.user_name, au.email, au.mobile_no, po.order_id, po.promo_code, po.original_price, po.discount, po.final_price, po.payment_order_id, po.payment_status,     
        po.payment_method, po.payment_txn_id, po.created_at, ps.start_date, ps.end_date, ps.is_active from prime_subscriptions ps
        inner join prime_orders po using(order_id)
        inner join app_users au on au.id = po.user_id
        order by user_id asc limit :page_size offset :offset_value)
        order by ${order_by} ${order_dir};
      `,
        {
          replacements: {
            page_size: Number(page_size),
            offset_value,
          },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );
    }
    const response = {
      total_items: total_records.count,
      page_number: page_number,
      page_size: page_size,
      items: data,
    };
    return api_response(
      res,
      200,
      1,
      "order data fetched successfully!",
      response
    );
  } catch (error) {
    console.error('Error ocured during fetch order list',error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
