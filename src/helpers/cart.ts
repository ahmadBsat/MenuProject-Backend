import { Types } from "mongoose";
import { cloneDeep } from "lodash";
import { handleProducts } from "./product";
import { Cart, CartItem } from "../types/user";
import { getCurrencyRate, map_product_items } from "../utils/common";
import { Product, ProductAddition } from "../types/product";

type ProductWithAddition = Product & {
  additions: {
    name: string;
    group: string;
    is_multiple: boolean;
    items: ProductAddition[];
  }[];
  populated_items: any[];
};

export const remove_cart_item = (
  products: CartItem[],
  product_id: string,
  product_additions?: Types.ObjectId[]
): CartItem[] => {
  return products.filter((product) => {
    // Check if product IDs match
    const isIdMatch = product.product_id.toString() === product_id;

    // Check if options match (only if options are provided)
    const isOptionsMatch = product_additions
      ? isSimilar(product.product_additions, product_additions)
      : true;

    // Keep the product only if it does not match both ID and options
    return !(isIdMatch && isOptionsMatch);
  });
};

/**
 * @description
 * Takes two options array,
 * and returns a boolean if the options array are similar.
 *
 * @param options Old Options array from the present products in the cart.
 * @param newOptions Options array for the new item the user trying to add.
 *
 * @returns boolean with true value if the options arrays are similar.
 */
export const isSimilar = (
  old_items: Types.ObjectId[],
  new_items: Types.ObjectId[]
) => {
  // Check if arrays have the same length
  if (old_items.length !== new_items.length) {
    return false;
  }

  // Create copies of the arrays to avoid modifying the originals
  const copy1 = old_items.slice().sort();
  const copy2 = new_items.slice().sort();

  // Compare each element in the sorted arrays
  for (let i = 0; i < copy1.length; i++) {
    if (copy1[i].toString() !== copy2[i].toString()) {
      return false;
    }
  }

  return true;
};

export const getCartData = async (
  cart: Cart,
  currency: string,
  store: string
) => {
  try {
    const rate = await getCurrencyRate(currency, store);
    const product_ids = cart.products.map((p) => p.product_id);

    const data = await handleProducts({
      rate,
      pipeline: [
        { $match: { _id: { $in: product_ids }, is_active: true } },
        {
          $lookup: {
            from: "productitems",
            localField: "additions.items",
            foreignField: "_id",
            as: "populated_items",
          },
        },
      ],
    });

    let total_price = 0;
    const temp = data.products as any as ProductWithAddition[];

    const products = temp.map((p) => {
      return {
        ...p,
        additions: p.additions.map((a: any) => {
          return {
            ...a,
            items: map_product_items(a.items, p.populated_items),
          };
        }),
      };
    });

    const cart_details = cart.products.map((cart_product) => {
      let product_data = cloneDeep(
        products.find(
          (p) => p._id.toString() === cart_product.product_id.toString()
        )
      );

      const cart_additions = product_data.additions.map((a) => {
        return {
          ...a,
          items: map_product_items(cart_product.product_additions, a.items),
        };
      });

      product_data.additions = cart_additions;

      // Calculate price based on quantity and additional prices from options
      let product_price = cloneDeep(product_data.price);
      let additional_prices = cloneDeep(0);

      cart_product.product_additions.forEach((addition_item) => {
        const selected_additions_item = find_item_by_id(
          product_data.additions,
          addition_item.toString()
        );

        const addition_with_rate =
          rate * selected_additions_item.additional_price;

        let position = null;
        let position_addition = 0;
        for (const addition of product_data.additions) {
          position = addition.items.findIndex(
            (x: any) => x._id.toString() === addition_item.toString()
          );

          if (position !== -1) break;

          position_addition++;
        }

        product_data.additions[position_addition].items[
          position
        ].additional_price = rate * selected_additions_item.additional_price;

        additional_prices += addition_with_rate * cart_product.quantity;
      });

      total_price += product_price * cart_product.quantity + additional_prices;

      //update with the variant price and their qty
      product_data.price =
        product_price * cart_product.quantity + additional_prices;

      return {
        ...product_data,
        quantity: cart_product.quantity,
      };
    });

    return {
      products: cart_details,
      count: cart.products.length,
      total_price: Number(total_price),
    };
  } catch (error) {
    console.log(error);
  }
};

const find_item_by_id = (
  additions: {
    name: string;
    group: string;
    is_multiple: boolean;
    items: ProductAddition[];
  }[],
  item_id: string
) => {
  for (const addition of additions) {
    const item = addition.items.find((item) => item._id.toString() === item_id);
    if (item) {
      return item;
    }
  }
  return null; // Return null if the item is not found
};
