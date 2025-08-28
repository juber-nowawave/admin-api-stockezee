import api_response from "../utils/api_response.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import db from "../models/index.js";

export const get_dashboard_info = async (req, res) => {
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
      where ar.id = :role_id and ap.name = 'dashboard' and app.name = 'view'
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
        "Unauthorized access!, you don't have permission to view admin dashboard info",
        null
      );
    }

    let [{ count: total_users }] = await db.sequelize.query(
      `select count(*) from app_users`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    let [{ count: today_signups }] = await db.sequelize.query(
      `select count(*) from app_users where created_at = current_date`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    let [{ count: inactive_users }] = await db.sequelize.query(
      `select count(*) from app_users where date(last_login) <= current_date - 30`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    let [{ count: total_orders }] = await db.sequelize.query(
      `select count(*) from prime_orders`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    let [{ count: completed_orders }] = await db.sequelize.query(
      `select count(*) from prime_orders where payment_status = 'Completed'`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    let [{ count: pending_orders }] = await db.sequelize.query(
      `select count(*) from prime_orders where payment_status = 'Pending'`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    let [{ count: cancelled_orders }] = await db.sequelize.query(
      `select count(*) from prime_orders where payment_status = 'Cancelled'`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    let [{ count: today_orders }] = await db.sequelize.query(
      `select count(*) from prime_orders where created_at = current_date`,
      {
        type: db.Sequelize.QueryTypes.SELECT,
      }
    );

    const data = {
      total_users: Number(total_users),
      active_users: Number(total_users) - Number(inactive_users),
      inactive_users: Number(inactive_users),
      total_orders: Number(total_orders),
      pending_orders: Number(pending_orders),
      completed_orders: Number(completed_orders),
      cancelled_orders: Number(cancelled_orders),
      today_signups: Number(today_signups),
      today_orders: Number(today_orders),
    };

    return api_response(
      res,
      200,
      1,
      "Dashboard data fetched succesfully",
      data
    );
  } catch (error) {
    console.error("Error occured during fetched dashboard info", error);
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
