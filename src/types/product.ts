import { InferSchemaType, Types } from "mongoose";
import { ProductSchema } from "../schemas/product/product";
import { ProductItemSchema } from "../schemas/product/product_item";

export type Product = InferSchemaType<typeof ProductSchema> & {
  _id: Types.ObjectId;
};

export type ProductAddition = InferSchemaType<typeof ProductItemSchema> & {
  _id: Types.ObjectId;
};

export type ProductPopulated = {
  additions: Pick<
    ProductAddition,
    "_id" | "name" | "image" | "additional_price"
  >[];
} & Product;
