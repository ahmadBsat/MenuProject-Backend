import express from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { UserModel } from "../schemas/user";
import { ERRORS } from "../constant/errors";
import { Logger } from "../entities/logger";
import { USER_ROLES } from "../constant/roles";
import { decodeJWT, generateUserToken } from "../utils/token";
import { registerValidation } from "../utils/validation/auth";
import { compareHashedPassword, hashAuthentication } from "../helpers/security";

dotenv.config();

export const register = async (req: express.Request, res: express.Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { value, error } = registerValidation(req.body);

    if (error) {
      await session.abortTransaction();
      return res.status(406).send({ status: 406, message: error }).end();
    }

    const { email, password, firstname, lastname } = value;
    const check_user = await UserModel.findOne({ email: email }).lean();

    if (check_user) {
      await session.abortTransaction();
      return res
        .status(406)
        .send({ status: 406, message: "Email already exist" })
        .end();
    }

    const hashedPassword = await hashAuthentication(password);

    const user = await UserModel.create({
      firstname,
      lastname,
      email,
      authentication: { password: hashedPassword },
      role: USER_ROLES.OWNER,
    });

    const token = generateUserToken(user._id.toString());
    const { authentication, is_active, is_archived, ...rest } = user.toJSON();

    await session.commitTransaction();

    return res.status(200).json({ user: rest, token }).end();
  } catch (error) {
    Logger.error(error);
    await session.abortTransaction();

    return res.status(500).send({ message: ERRORS.SERVER });
  } finally {
    await session.endSession();
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing information" })
        .end();
    }

    const user = await UserModel.findOne({
      email: email,
      is_archived: false,
    }).lean();

    if (!user) {
      return res
        .status(404)
        .send({ status: 404, message: "Email or password is incorrect" });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: "Account not activated" });
    }

    const isCorrectPassword = await compareHashedPassword(
      password,
      user.authentication.password
    );

    if (!isCorrectPassword) {
      return res
        .status(404)
        .send({ status: 404, message: "Email or password is incorrect" });
    }

    const user_id = user._id.toString();
    const token = generateUserToken(user_id);

    const { authentication, is_active, is_archived, ...rest } = user;

    return res.status(200).json({ user: rest, token }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(500).send({ message: ERRORS.SERVER });
  }
};

export const validate = async (req: express.Request, res: express.Response) => {
  try {
    const sessionToken = req.headers.authorization;

    if (!sessionToken) {
      return res
        .status(403)
        .send({ status: 403, message: "Not authenticated" });
    }

    const token = sessionToken.split(" ")[1];
    const decodedToken = decodeJWT(token);
    const user = await UserModel.findOne({
      _id: decodedToken._id,
      is_active: true,
      is_archived: false,
    }).lean();

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User account not found or not verified",
      });
    }

    const { authentication, is_active, is_archived, ...rest } = user;

    return res.status(200).json({ user: rest, token }).end();
  } catch (error) {
    Logger.error(error);
    return res
      .status(406)
      .send({ message: "Server error please try again later" });
  }
};

export const change_password = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let { current_password, new_password } = req.body;

    const sessionToken = req.headers.authorization;
    const token = sessionToken.split(" ")[1];
    const decodedToken = decodeJWT(token);

    if (!current_password || !new_password) {
      return res
        .status(400)
        .send({ status: 400, message: "Missing information" });
    }

    const user = await UserModel.findById(decodedToken._id);

    const isCorrectPassword = await compareHashedPassword(
      current_password,
      user.authentication.password
    );

    if (!isCorrectPassword) {
      return res
        .status(400)
        .send({ status: 400, message: "Current password is incorrect" });
    }

    const hashedpassword = await hashAuthentication(new_password);
    await UserModel.findByIdAndUpdate(decodedToken._id, {
      "authentication.password": hashedpassword,
    });

    return res
      .status(200)
      .json({
        status: 200,
        success: true,
        message: "Password changed successfully",
      })
      .end();
  } catch (error) {
    Logger.error(error);
    return res.status(500).json({ message: ERRORS.SERVER });
  }
};

export const forgot_password = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ status: 400, message: "Email is missing" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (user.authentication.recovery_token) {
      return res.status(400).json({
        message:
          "Reset link already sent to you're email, please check you're inbox and spam folder",
      });
    }

    let token = generateUserToken(user._id.toString(), { email: user.email });

    user.authentication.recovery_token = token;
    user.authentication.recovery_sent_at = Date.now().toString();

    await user.save();

    return res
      .status(200)
      .json({
        status: 200,
        success: true,
        message: "Reset link sent to you're email",
      })
      .end();
  } catch (error) {
    Logger.error(error);
    return res.status(500).json({ message: ERRORS.SERVER });
  }
};

export const reset_user_password = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).send({ status: 400, message: "Invalid request" });
    }

    const decodedToken = decodeJWT(token);
    const user = await UserModel.findOne({
      _id: decodedToken._id,
      email: decodedToken.email,
    });

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const current_date = new Date();
    const hashedpassword = await hashAuthentication(password);

    await UserModel.findByIdAndUpdate(user._id, {
      "authentication.password": hashedpassword,
    });

    return res
      .status(200)
      .json({
        status: 200,
        success: true,
        message: "Password changed successfully",
      })
      .end();
  } catch (error) {
    Logger.error(error);
    return res.status(500).json({ message: ERRORS.SERVER });
  }
};
