
import bcrypt from "bcryptjs";
import type { TokenPayload } from "google-auth-library";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import {
	AuthProvider,
	Role,
	UserStatus,
} from "../../../prisma/schema/enum.prisma";
import config from "../../config";
import { googleClient } from "../../lib/googleAuth";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";

import { redisClient } from "../../lib/redis";
import { transporter } from "../../lib/nodemailer";
import path from "path";
import ejs from "ejs";

const registerReceiver = async (payload: IRegisterReceiverPayload) => {
	const { name, password, receiver: receiverData } = payload;

	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new Error("User with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	//for user registration info storing in redis database untill otp is verified and after that it will be removed from redis

	//for otp
	const expirationSeconds = 5 * 60;
	const otpKey = `Receiver registration otp: ${email}`;
	const otpValue = crypto.randomInt(100000, 1000000).toString();
	await redisClient.set(otpKey, otpValue, {
		expiration: {
			type: "EX",
			value: expirationSeconds,
		},
	});

	//registration data store untill email gets verified
	const receiverRegistrationKey = `receiver-registration-data:${email}`;
	const redisUserDataPayload = {
		name,
		email,
		password: hashedPassword,
		patient: receiverData,
	};

	await redisClient.set(
		patientRegistrationKey,
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
		"src/app/templates/registrationUserOtp.ejs",
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


export const AuthService = {
	registerReceiver,
	
};
