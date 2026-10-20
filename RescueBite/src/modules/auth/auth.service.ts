// /** biome-ignore-all lint/style/useConst: <explanation> */

import crypto from "node:crypto";
import path from "node:path";
import bcrypt from "bcryptjs";
import ejs from "ejs";
import type { TokenPayload } from "google-auth-library";
import httpStatus from "http-status";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { AuthProvider, Role, UserStatus } from "../../generated/prisma/enums";
import { googleClient } from "../../lib/googleAuth";
import { transporter } from "../../lib/nodemailer";
import { prisma } from "../../lib/prisma";
import { ensureRedisConnected, redisClient } from "../../lib/redis";
import { AppError } from "../../utils/AppError";
import { jwtUtils } from "../../utils/jwt";
import type {
	IForgotPassword,
	IGoogleLoginPayload,
	ILoginUserPayload,
	IRegisterCustomerPayload,
	IResetpassword,
	IVerifyEmailPayload,
} from "./auth.interface";

const registerCustomer = async (payload: IRegisterCustomerPayload) => {
	const { name, password, role, customer: customerData } = payload;

	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	//for user registration info storing in redis database untill otp is verified and after that it will be removed from redis

	//connect lazily (server no longer blocks boot on Redis)
	await ensureRedisConnected();

	//for otp
	const expirationSeconds = 5 * 60;
	const otpKey = `customer registration otp: ${email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();
	await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});

	//registration data store untill email gets verified
	const customerRegistrationKey = `customer-registration-data:${email}`;
	const redisUserDataPayload = {
		name,
		email,
		password: hashedPassword,
		role,
		customer: customerData,
	};

	await redisClient.set(
		customerRegistrationKey,
		JSON.stringify(redisUserDataPayload),
		{
			expiration: {
				type: "EX",
				value: expirationSeconds,
			},
		},
	);

	//path set for otp design file
	const templatePath = path.join(
		process.cwd(),
		"src/templates/registrationUserOtp.ejs",
	);

	const templateData = {
		name,
		email,
		otp: otpValue,
		expirationMinutes: expirationSeconds / 60,
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transporter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Email Verification",
		html,
	});
};

const verifyCustomerEmail = async (payload: IVerifyEmailPayload) => {
	const otp = payload.otp;
	const email = payload.email.trim().toLocaleLowerCase();

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExist?.status === "BLOCKED") {
		throw new Error("User is Blocked");
	}

	if (isUserExist?.emailVerified) {
		throw new Error("Email ALready Verified");
	}

	if (isUserExist?.isDeleted || isUserExist?.status === "DELETED") {
		throw new Error("User is Deleted");
	}

	const otpKey = `customer registration otp: ${email}`;
	await ensureRedisConnected();
	const redisOtp = await redisClient.get(otpKey);

	if (!redisOtp) {
		throw new Error("Invalid OTP");
	}

	if (redisOtp !== otp) {
		throw new Error("OTP Does Not Match");
	}

	await redisClient.del([otpKey]);

	const customerRegistrationKey = `customer-registration-data:${email}`;
	const rediscustomerData = await redisClient.get(customerRegistrationKey);

	if (!rediscustomerData) {
		throw new Error("customer Doesnt Exist");
	}

	const customerPayload: IRegisterCustomerPayload =
		JSON.parse(rediscustomerData);

	const role = customerPayload.role ?? Role.RECEIVER;

	const createdUser = await prisma.user.create({
		data: {
			name: customerPayload.name,
			email: customerPayload.email,
			password: customerPayload.password,
			role,
			status: UserStatus.ACTIVE,
			emailVerified: true,
			customer:
				role === Role.RECEIVER
					? {
							create: {
								name: customerPayload.name,
								email: customerPayload.email,
								contactNumber: customerPayload?.customer?.contactNumber || "",
							},
						}
					: undefined,
		},
		omit: { password: true },
		include: { customer: role === Role.RECEIVER },
	});

	await redisClient.del(customerRegistrationKey);

	const templatePath = path.join(
		process.cwd(),
		"src/templates/welcomeCustomer.ejs",
	);

	const templateData = {
		name: customerPayload.name,
	};

	const html = await ejs.renderFile(templatePath, templateData);

	await transporter.sendMail({
		from: config.email_sender,
		to: email,
		subject: "Welcome to RescueBite",
		html,
	});

	const { customer, ...user } = createdUser;
	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		user,
		customer,
		accessToken,
		refreshToken,
	};
};

const loginUser = async (payload: ILoginUserPayload) => {
	const { password } = payload;
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new Error("User not found");
	}

	if (user.status === UserStatus.BLOCKED) {
		throw new Error("User is blocked");
	}

	if (user.isDeleted || user.status === UserStatus.DELETED) {
		throw new Error("User is deleted");
	}

	const isPasswordMatched = await bcrypt.compare(
		password,
		user.password as string,
	);

	if (!isPasswordMatched) {
		throw new Error("Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const refreshToken = async (token: string) => {
	const verifiedRefreshToken = jwtUtils.verifyToken(
		token,
		config.jwt_refresh_secret,
	);

	if (!verifiedRefreshToken.success || !verifiedRefreshToken.data) {
		throw new Error(
			config.node_env === "development"
				? verifiedRefreshToken.error
				: "Invalid refresh token",
		);
	}

	const data = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUnique({
		where: { id: data.userId },
	});

	if (!user || user.isDeleted || user.status !== UserStatus.ACTIVE) {
		throw new Error("User is inactive or not found");
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

const forgotPassword = async (payload: IForgotPassword) => {
	const { email } = payload;

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});
	if (!isUserExists) throw new Error("user doesn't exists");
	if (!isUserExists.emailVerified) throw new Error("User not verified");
	if (isUserExists.status === "BLOCKED") throw new Error("user is blocked");
	if (isUserExists.isDeleted || isUserExists.status === "DELETED")
		throw new Error("user is deleted");

	const otp = crypto.randomInt(100000, 999999).toString();
	const key = `forgot-password-otp:${isUserExists.email}`;
	await ensureRedisConnected();
	await redisClient.set(key, otp, {
		expiration: {
			type: "EX",
			value: 5 * 60,
		},
	});
	await transporter.sendMail({
		from: config.email_sender,
		to: isUserExists.email,
		subject: "OTP for password change",
		text: `your OTP is ${otp}`,
	});
};
const resetPassword = async (payload: IResetpassword) => {
	const { email, newPassword, otp } = payload;

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});
	if (!isUserExists) throw new Error("user doesn't exists");
	if (!isUserExists.emailVerified) throw new Error("User not verified");
	if (isUserExists.status === "BLOCKED") throw new Error("user is blocked");
	if (isUserExists.isDeleted || isUserExists.status === "DELETED")
		throw new Error("user is deleted");
	const key = `forgot-password-otp:${isUserExists.email}`;

	await ensureRedisConnected();
	const redisOTP = await redisClient.get(key);
	if (!redisOTP) throw new Error("invalid otp");
	if (String(redisOTP) !== String(otp)) throw new Error("otp doesn't match");

	const hashedNewPassword = await bcrypt.hash(
		newPassword,
		Number(config.bcrypt_salt_rounds),
	);
	await prisma.user.update({
		where: { email: isUserExists.email },
		data: { password: hashedNewPassword },
	});
	await redisClient.del([key]);
	await transporter.sendMail({
		from: config.email_sender,
		to: isUserExists.email,
		subject: "Password Reset Successful",
		text: `password got changeed into new one`,
	});
};

const googleLogin = async (payload: IGoogleLoginPayload) => {
	let googleIdTokenPayload: TokenPayload | null | undefined;
	try {
		const ticket = await googleClient.verifyIdToken({
			idToken: payload.idToken,
			audience: config.google_client_id,
		});
		googleIdTokenPayload = ticket.getPayload();
	} catch {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Invalid Or Expired Google Id Token",
		);
	}

	if (
		!googleIdTokenPayload?.sub ||
		!googleIdTokenPayload.email ||
		googleIdTokenPayload.email_verified !== true
	) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			"Google account email is missing or not verified",
		);
	}
	if (!googleIdTokenPayload.name) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Google Email User Name Not Found",
		);
	}

	const email = googleIdTokenPayload.email.trim().toLowerCase();
	const [userByEmail, userByGoogleId] = await Promise.all([
		prisma.user.findUnique({ where: { email } }),
		prisma.user.findUnique({ where: { googleId: googleIdTokenPayload.sub } }),
	]);

	if (userByGoogleId && userByGoogleId.email.trim().toLowerCase() !== email) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Google account is linked to a different email",
		);
	}
	if (userByEmail && userByGoogleId && userByEmail.id !== userByGoogleId.id) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Google account is linked to another user",
		);
	}

	let user = userByEmail ?? userByGoogleId;
	if (user) {
		if (!user.emailVerified) {
			throw new AppError(httpStatus.FORBIDDEN, "Email Not Verified");
		}
		if (user.status === UserStatus.BLOCKED) {
			throw new AppError(httpStatus.FORBIDDEN, "User Is Blocked");
		}
		if (user.isDeleted || user.status === UserStatus.DELETED) {
			throw new AppError(httpStatus.FORBIDDEN, "User Is Deleted");
		}
		if (user.googleId !== googleIdTokenPayload.sub) {
			user = await prisma.user.update({
				where: { id: user.id },
				data: { googleId: googleIdTokenPayload.sub },
			});
		}
	} else {
		user = await prisma.user.create({
			data: {
				name: googleIdTokenPayload.name,
				email,
				role: Role.RECEIVER,
				googleId: googleIdTokenPayload.sub,
				authProvider: AuthProvider.GOOGLE,
				emailVerified: true,
				customer: {
					create: {
						name: googleIdTokenPayload.name,
						email,
					},
				},
			},
		});
		const templatePath = path.join(
			process.cwd(),
			"src/templates/welcomeCustomer.ejs",
		);
		const html = await ejs.renderFile(templatePath, { name: user.name });
		await transporter.sendMail({
			from: config.email_sender,
			to: user.email,
			subject: "Welcome to RescueBite",
			html,
		});
	}

	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions,
	);

	return { accessToken, refreshToken };
};
export const AuthService = {
	registerCustomer,
	verifyCustomerEmail,
	loginUser,
	refreshToken,
	forgotPassword,
	resetPassword,
	googleLogin,
};
