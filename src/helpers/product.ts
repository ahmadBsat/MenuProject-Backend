import {
  calculateFinalPrice,
  calculate_pages,
  handleParams,
} from "../utils/common";
import { RootFilterQuery } from "mongoose";
import { Product, ProductPopulated } from "../types/product";
import { ProductModel } from "../schemas/product/product";

export const handleProducts = async ({
  filter,
  populate,
  req_query,
  get_meta = true,
  rate,
}: {
  filter: RootFilterQuery<Product>;
  populate?: any;
  req_query?: any;
  get_meta?: boolean;
  rate: number;
}) => {
  const $and: Record<string, any>[] = [];
  const query: Record<string, any> = { ...filter };
  const { limit, page, skip, sortBy } = handleParams(req_query);

  if ($and.length > 0) {
    query.$and = $and;
  }

  let meta;
  //only used for pagination
  if (get_meta) {
    const count = await ProductModel.countDocuments(query);
    const { meta: meta_result } = calculate_pages(count, page, limit);

    meta = meta_result;
  }

  //   const products: Product[] = await ProductModel.find(query)
  //     .populate(populate)
  //     .sort(sortBy)
  //     .limit(limit)
  //     .skip(skip)
  //     .lean();

  const match = { $match: query };
  const lookup = { $lookup: {} };

  const products = await ProductModel.aggregate<ProductPopulated>([]);

  const products_data: Omit<
    ProductPopulated,
    "is_active" | "createdAt" | "updatedAt"
  >[] = products.map((product) => {
    const updated_product = calculateFinalPrice(product, rate);
    const { createdAt, updatedAt, is_active, ...rest } = updated_product;

    return { ...rest, additions: [] };
  });

  return { products: products_data, meta };
};
