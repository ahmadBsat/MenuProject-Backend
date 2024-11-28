import express from "express";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { decodeJWT } from "../utils/token";
import { UserModel } from "../schemas/user";
import { USER_ROLES } from "../constant/roles";
import { Logger } from "../entities/logger";
import { ERRORS } from "../constant/errors";

dotenv.config();

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.headers.authorization;

    if (!sessionToken) {
      return res.status(401).json({ message: ERRORS.NO_AUTH });
    }

    const token = sessionToken.split(" ")[1];
    const decodedToken = decodeJWT(token);
    const current_user = await UserModel.findOne({
      _id: decodedToken._id,
      is_active: true,
    }).lean();

    if (!current_user) {
      return res.status(403).json({ message: ERRORS.NO_AUTH });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(404).json({ message: err.message, err });
      }

      res.locals.user = current_user;

      next();
    });
  } catch (error) {
    Logger.error(error);
    return res.sendStatus(400);
  }
};

/**
 * Minimum role required to access a route
 *
 * @param roles
 * @returns void
 */
export const hasRole = (roles: Array<string>) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const member = res.locals.member;

      // Check if the user role is one of the permissible roles
      if (!roles.includes(member.role) && member.role !== USER_ROLES.OWNER) {
        return res.status(403).json({ message: "Not Authorized" });
      }

      next();
    } catch (error) {
      Logger.error(error);
      return res.status(400).json({ message: "Bad Request" });
    }
  };
};

/**
 * Checks if the current user is super admin
 */
export const isAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user = res.locals.user;

    if (!user.is_super_admin) {
      return res.status(403).send({
        status: 403,
        message: "Not authorized, cannot access admin routes",
      });
    }

    next();
  } catch (error) {
    Logger.error(error);
    return res.sendStatus(400);
  }
};
