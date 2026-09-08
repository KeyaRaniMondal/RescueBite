import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	node_env: process.env.NODE_ENV!,
	port: process.env.PORT!,
	database_url: process.env.DATABASE_URL!,
	bak_url: process.env.APP_URL!,
	frontend_url: process.env.FRONTEND_URL!,
	bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS!,
	jwt_access_secret: process.env.JWT_ACCESS_SECRET!,
	jwt_refresh_secret: process.env.JWT_REFRESH_SECRET!,
	jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN!,
	jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN!,
	redis_username: process.env.REDIS_USERNAME!,
	redis_password: process.env.REDIS_PASSWORD!,
	redis_host: process.env.REDIS_HOST!,
	redis_port: process.env.REDIS_PORT!,
	smtp_password: process.env.SMTP_PASSWORD!,
	smtp_user: process.env.SMTP_USER!,
	email_sender: process.env.EMAIL_SENDER!,
	ssl_commerz_store_id: process.env.SSL_COMMERZ_STORE_ID!,
	ssl_commerz_store_password: process.env.SSL_COMMERZ_STORE_PASSWORD!,
	sslcommerz_init_url: process.env.SSLCOMMERZ_INIT_URL!,
	sslcommerz_validation_url: process.env.SSLCOMMERZ_VALIDATION_URL!,
	sslcommerz_success_url: process.env.SSLCOMMERZ_SUCCESS_URL!,
	sslcommerz_fail_url: process.env.SSLCOMMERZ_FAIL_URL!,
	sslcommerz_cancel_url: process.env.SSLCOMMERZ_CANCEL_URL!,
	sslcommerz_ipn_url: process.env.SSLCOMMERZ_IPN_URL!,
	cloudinary_cloud_name: process.env.CLOUDE_NAME!,
	cloudinary_api_key: process.env.CLOUDINARY_API_KEY!,
	cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET!,
};
