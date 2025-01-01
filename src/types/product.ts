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
  additions: {
    group: string;
    items: Pick<
      ProductAddition,
      "_id" | "name" | "image" | "additional_price"
    >[];
  };
  old_price?: number;
} & Omit<Product, "createdAt" | "updatedAt">;
