import { UserSchema } from "../schemas/user";
import { InferSchemaType, Types } from "mongoose";
import { CartItemSchema, CartSchema } from "../schemas/cart";

export type User = InferSchemaType<typeof UserSchema> & {
  _id: Types.ObjectId;
};

export type Cart = InferSchemaType<typeof CartSchema>;

export type CartItem = InferSchemaType<typeof CartItemSchema>;
