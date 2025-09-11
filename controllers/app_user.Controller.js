import api_response from "../utils/api_response.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import db from "../models/index.js";

export const get_all_user = async (req, res) => {
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

    let {
      page_number,
      page_size,
      search_keyword,
      search_by,
      order_by,
      order_dir,
    } = req.query;

    if (!page_number || !page_size || !order_by || !order_dir || search_keyword === undefined || search_by === undefined) {
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

    search_keyword = search_keyword.trim();
    search_by = search_by.trim();
    if (search_keyword != "" && search_by != "") {
      data = await db.sequelize.query(
        `
        select * from 
        (select id, user_name, email, is_email_verify, mobile_no, is_mobile_no_verify,
         gender, login_method, last_login, created_at from app_users
         where ${search_by} like '%${search_keyword}%'
         order by id asc limit :page_size offset :offset_value)
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
    } else {
      data = await db.sequelize.query(
        `
        select * from 
        (select id, user_name, email, is_email_verify, mobile_no, is_mobile_no_verify,
         gender, login_method, last_login, created_at from app_users 
         order by id asc limit :page_size offset :offset_value) 
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
    console.error("Error occured during fetched app users", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const get_specific_user = async (req, res) => {
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

    const { id } = req.query;

    if (!id) {
      return api_response(res, 401, 0, "Missing id!", null);
    }

    const [user_info] = await db.sequelize.query(
      `
       select id as user_id, user_name, email, is_email_verify, country_code, mobile_no, is_mobile_no_verify, 
       profile_pic, gender, dob, country, state, city, pin_code, occupation, industry, login_method,
       social_id, last_login, created_at from app_users where id = :id
      `,
      {
        replacements: { id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    const order_info = await db.sequelize.query(
      `
      select pp.name as plan_type, pp.duration as plan_duration, pp.plan_id, po.order_id, ps.id as membership_id, po.promo_code, po.original_price, po.discount, po.final_price, po.payment_order_id, po.payment_status,     
        po.payment_method, po.payment_txn_id, po.created_at as order_date, ps.start_date, ps.end_date, ps.is_active from prime_subscriptions ps
        inner join prime_orders po using(order_id)
        inner join app_users au on au.id = po.user_id
        inner join prime_plans pp using(plan_id) 
        where po.user_id = :id
     `,
      {
        replacements: { id },
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    const data = {
      user_detail: user_info,
      order_info: order_info,
    };

    return api_response(res, 200, 1, "user data fetched successfully!", data);
  } catch (error) {
    console.error("Error occured during fetched app user", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};

export const get_all_orders = async (req, res) => {
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

    let {
      page_number,
      page_size,
      search_keyword,
      search_by,
      order_by,
      order_dir,
      order_type,
    } = req.query;

    if (
      !page_number ||
      !page_size ||
      !order_by ||
      !order_dir ||
      !order_type ||
      search_keyword === undefined ||
      search_by === undefined
    ) {
      return api_response(res, 401, 0, "Missing parameters!", null);
    }

    let data = [];
    const offset_value = Number(page_size) * (Number(page_number) - 1);
    const valid_dirs = ["asc", "desc"];

    if (!valid_dirs.includes(order_dir.toLowerCase())) {
      return api_response(res, 400, 0, "Invalid order_dir value", null);
    }

    const [total_records] = await db.sequelize.query(
      `select count(po.order_id) as count from prime_orders po
        left join prime_subscriptions ps using(order_id)
        left join app_users au on au.id = po.user_id`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    search_by = search_by.trim();
    search_keyword = search_keyword.trim();

    let where_query = `where au.${search_by} like '%${search_keyword}%'`;

    if (search_by === "order_id" && !isNaN(search_keyword)) {
      where_query = `where po.${search_by} = '${search_keyword}'`;
    } else if (search_by === "order_id" && isNaN(search_keyword)) {
      return api_response(res, 200, 1, "order data fetched successfully!", {
        total_items: total_records.count,
        page_number: page_number,
        page_size: page_size,
        items: data,
      });
    } else if (search_by === "order_date" && search_keyword.includes("/")) {
      const [date1, date2] = search_keyword.split("/");
      where_query = `where po.created_at between '${date1.trim()}' and '${date2.trim()}'`;
    } else if (search_by === "order_date" && !search_keyword.includes("/")) {
      return api_response(res, 200, 1, "order data fetched successfully!", {
        total_items: total_records.count,
        page_number: page_number,
        page_size: page_size,
        items: data,
      });
    }

    if (order_type.trim() !== "All" && order_type.trim() !== "") {
      where_query += ` and po.payment_status = :order_type`;
    }

    if (search_keyword != "" && search_by != "") {
      data = await db.sequelize.query(
        `
        select * from
        (select au.id as user_id, au.user_name, au.email, au.mobile_no, po.order_id, po.promo_code, po.original_price, po.discount, po.final_price, po.payment_order_id, po.payment_status,     
        po.payment_method, po.payment_txn_id, po.created_at as order_date, ps.start_date, ps.end_date, ps.is_active, po.payment_msg from prime_orders po
        left join prime_subscriptions ps using(order_id)
        left join app_users au on au.id = po.user_id
        ${where_query}
        order by user_id asc limit :page_size offset :offset_value)
        order by ${order_by} ${order_dir};
      `,
        {
          replacements: {
            page_size: Number(page_size),
            search_keyword: search_keyword.trim(),
            offset_value,
            order_type,
          },
          type: db.Sequelize.QueryTypes.SELECT,
          // logging: console.log,
        }
      );
    } else {
      if (order_type.trim() !== "All" && order_type.trim() !== "") {
        where_query = `where po.payment_status = :order_type`;
      } else where_query = "";

      data = await db.sequelize.query(
        `
        select * from
        (select au.id as user_id, au.user_name, au.email, au.mobile_no, po.order_id, po.promo_code, po.original_price, po.discount, po.final_price, po.payment_order_id, po.payment_status,     
        po.payment_method, po.payment_txn_id, po.created_at as order_date, ps.start_date, ps.end_date, ps.is_active, po.payment_msg from prime_orders po
        left join prime_subscriptions ps using(order_id)
        left join app_users au on au.id = po.user_id
        ${where_query}
        order by user_id asc limit :page_size offset :offset_value)
        order by ${order_by} ${order_dir};
      `,
        {
          replacements: {
            page_size: Number(page_size),
            offset_value,
            order_type,
          },
          type: db.Sequelize.QueryTypes.SELECT,
          // logging: console.log,
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
    console.error("Error ocured during fetch order list", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
