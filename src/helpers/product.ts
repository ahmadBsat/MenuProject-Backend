import { PipelineStage } from "mongoose";
import { ProductPopulated } from "../types/product";
import { calculateFinalPrice } from "../utils/common";
import { ProductModel } from "../schemas/product/product";

export const handleProducts = async ({
  pipeline,
  rate,
}: {
  pipeline: PipelineStage[];
  rate: number;
}) => {
  const products = await ProductModel.aggregate<ProductPopulated>(pipeline);

  const products_data: any[] = products.map((product) => {
    const updated_product = calculateFinalPrice(product, rate);
    const {
      createdAt,
      updatedAt,
      is_active,
      category,
      branch,
      store,
      ...rest
    } = updated_product;

    return { ...rest };
  });

  return { products: products_data };
};
