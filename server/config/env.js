require("dotenv").config();

module.exports = {
  PORT:             process.env.PORT             || 4000,
  JWT_SECRET:       process.env.JWT_SECRET       || "supersecretkey_change_in_production",
  JWT_EXPIRES_IN:   process.env.JWT_EXPIRES_IN   || "24h",
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || "adminsecretkey_change_in_production",
  TEACHER_JWT_SECRET: process.env.TEACHER_JWT_SECRET || "teachersecretkey_change_in_production",

  // MySQL
  DB_HOST:     process.env.DB_HOST     || "localhost",
  DB_PORT:     parseInt(process.env.DB_PORT || "3306", 10),
  DB_USER:     process.env.DB_USER     || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME:     process.env.DB_NAME     || "smart_student_service",
};
