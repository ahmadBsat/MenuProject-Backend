import { Types } from "mongoose";
import { parseURL } from "whatwg-url";
import { Product } from "../types/product";
import { cloneDeep, isEmpty } from "lodash";
import { CurrencyModel } from "../schemas/currency";

/**
 * Generates a random token of specified length.
 *
 * @param length - Length of the token to be generated. Default is 16.
 * @returns A random token string.
 */
export const generate_random_token = (length: number = 16): string => {
  let token = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }

  return token;
};

/**
 * Checks if the URL parameter is a valid URL
 *
 * @param url - A valid url link
 * @returns A boolean value.
 */
export const is_validate_url = (url: string): boolean => {
  try {
    const result = parseURL(url);
    return Boolean(result.host);
  } catch {
    return false;
  }
};

export const success_msg = (msg: string) => {
  return { status: 200, success: true, message: msg };
};

export const calculate_pages = (
  documents_count: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(documents_count / limit);
  const has_next = page < totalPages;
  const has_previous = page > 1 && totalPages > 1;

  const result = {
    meta: {
      count: documents_count,
      page,
      limit,
      total_pages: totalPages,
      has_next,
      has_previous,
    },
  };

  return result;
};

export const getSkipNumber = (page: number, limit: number) => {
  const skip = page * limit - limit;
  return skip;
};

export const extractKeyFromUrl = (url: string) => {
  const urlParts = new URL(url);
  // Assuming the key is the pathname after the domain, and removing the initial '/'
  const key = urlParts.pathname.substring(1);
  const version = urlParts.searchParams.get("versionId");

  return { key, version };
};

export const handleParams = (params: any, keys?: string[]) => {
  if (!params) {
    params = {};
  }

  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 50;

  let sortBy: any = {};
  const sort = params.sort;

  const sortField = params.sortField;
  const sortOrder = params.sortOrder || "ASC";

  if (sortField) {
    sortBy[sortField] =
      sortOrder.toUpperCase() === "ASC" ||
      sortOrder.toUpperCase() === "ASCENDING"
        ? 1
        : -1;
  }

  const search: any[] = [];
  const searchQuery = params.search;
  const search_keys = keys ? keys : ["name"];

  const keyword = new RegExp(searchQuery, "i");
  search_keys.forEach((value: any) => {
    const data: any = {};
    data[value] = keyword;
    search.push(data);
  });

  const skip = getSkipNumber(page, limit);

  if (isEmpty(sortBy)) {
    sortBy = { createdAt: -1 };
  }

  return { page, limit, sortBy, skip, sort, search };
};

export const getCurrencyRate = async (
  currency_val: any,
  store: string | Types.ObjectId
) => {
  if (!currency_val) return 1;

  try {
    let rate_change = 1;

    const currency = await CurrencyModel.findOne({ name: currency_val, store })
      .select("rate_change")
      .lean();

    if (currency) {
      rate_change = currency.rate_change;
    }

    return rate_change;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export const generateSlug = (slug: string) => {
  return `${slug}-${Math.random().toString(36).substring(2, 9)}`;
};

export const calculateFinalPrice = (product: Product, rate: number) => {
  // Clone the product to avoid mutating the original object
  let updated_product = cloneDeep(product);
  let old_price = cloneDeep(product.price * rate);

  updated_product.price = Number((updated_product.price * rate).toFixed(2));

  return { ...updated_product, old_price };
};
