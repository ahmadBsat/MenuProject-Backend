import express from "express";
import { User } from "../../types/user";
import { ERRORS } from "../../constant/errors";
import { Logger } from "../../entities/logger";
import { StoreModel } from "../../schemas/store/store";
import { ProductModel } from "../../schemas/product/product";
import { calculate_pages, handleParams, success_msg } from "../../utils/common";
import * as XLSX from "xlsx";
import multer from "multer";
import { CategoryModel } from "../../schemas/category";

export const getStoreProducts = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user = res.locals.user as User;
    const { limit, page, skip, sortBy } = handleParams(req.query);

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const { search } = req.query;

    const query: Record<string, any> = {};

    if (search && typeof search === "string") {
      query.$or = [{ name: { $regex: search.trim(), $options: "i" } }];
    }

    const products = await ProductModel.find({ store: store._id, ...query })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();

    const count = await ProductModel.countDocuments({
      store: store._id,
      ...query,
    });
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: products, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getProductsByStoreId = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { limit, page, skip, sortBy } = handleParams(req.query);

    if (!id) {
      return res.status(404).json({ message: ERRORS.STORE_ID_REQUIRED });
    }

    const store = await StoreModel.findOne({ _id: id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const products = await ProductModel.find({ store: store._id })
      .limit(limit)
      .skip(skip)
      .sort(sortBy)
      .lean();

    const count = await ProductModel.countDocuments({ store: store._id });
    const { meta } = calculate_pages(count, page, limit);

    return res.status(200).json({ data: products, meta }).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const getProductById = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const user = res.locals.user as User;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const product = await ProductModel.findOne({
      _id: id,
      store: store._id,
    }).lean();

    return res.status(200).json(product).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const createStoreProduct = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const data = req.body;
    const user = res.locals.user as User;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const { category } = data;

    if (!category || category.length === 0) {
      return res.status(400).json({ message: "Category is required" });
    }

    await ProductModel.create({ ...data, store: store._id });

    return res.status(200).json(success_msg("Product created")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const updateStoreProduct = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const data = req.body;
    const { id } = req.params;
    const user = res.locals.user as User;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    const { category } = data;

    if (!category || category.length === 0) {
      return res.status(400).json({ message: "Category is required" });
    }

    await ProductModel.updateOne(
      { _id: id, store: store._id },
      { ...data },
      { upsert: true }
    );

    return res.status(200).json(success_msg("Product updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteStoreProduct = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const user = res.locals.user as User;

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    await ProductModel.deleteOne({ _id: id, store: store._id });

    return res.status(200).json(success_msg("Product deleted")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel and CSV files are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const createBulkStoreProducts = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const user = res.locals.user as User;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const store = await StoreModel.findOne({ owner: user._id }).lean();

    if (!store) {
      return res.status(404).json({ message: ERRORS.NO_USER_STORE });
    }

    // Parse Excel file
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // Validate and prepare products
    const products = [];
    const errors = [];
    const createdCategories: string[] = []; // Track auto-created categories

    for (let i = 0; i < jsonData.length; i++) {
      const row: any = jsonData[i];
      const rowNumber = i + 2;

      try {
        // Validate required fields
        if (!row.name || !row.category) {
          errors.push({
            row: rowNumber,
            message: "Name and category are required",
          });
          continue;
        }

        // Parse category names
        let categoryNames: string[];
        if (typeof row.category === "string") {
          categoryNames = row.category
            .split(",")
            .map((c: string) => c.trim())
            .filter((c: string) => c.length > 0);
        } else if (Array.isArray(row.category)) {
          categoryNames = row.category
            .map((c: any) => String(c).trim())
            .filter((c: string) => c.length > 0);
        } else {
          errors.push({
            row: rowNumber,
            message: "Invalid category format",
          });
          continue;
        }

        if (categoryNames.length === 0) {
          errors.push({
            row: rowNumber,
            message: "At least one category is required",
          });
          continue;
        }

        // Find existing categories
        let categories = await CategoryModel.find({
          name: { $in: categoryNames },
          store: store._id,
        }).select("_id name");

        const foundCategoryNames = categories.map((c) => c.name);
        const missingCategories = categoryNames.filter(
          (name) => !foundCategoryNames.includes(name)
        );

        // Auto-create missing categories
        if (missingCategories.length > 0) {
          const newCategories = await CategoryModel.insertMany(
            missingCategories.map((name) => ({
              name: name,
              store: store._id,
              status: "active", // Set default status
              // Add any other required fields for your Category model
            }))
          );

          // Track created categories for the response
          createdCategories.push(...missingCategories);

          // Add new categories to the list
          categories = [...categories, ...newCategories];
        }

        const categoryIds = categories.map((c) => c._id);

        // Validate and parse price
        const price = parseFloat(row.price);
        if (isNaN(price) || price < 0) {
          errors.push({
            row: rowNumber,
            message: "Invalid price value",
          });
          continue;
        }

        // Validate and parse stock
        const stock = parseInt(row.stock) || 0;
        if (stock < 0) {
          errors.push({
            row: rowNumber,
            message: "Stock cannot be negative",
          });
          continue;
        }

        // Parse status from Excel (optional column)
        const status = row.status?.toLowerCase() === "inactive" ? "inactive" : "active";

        // Prepare product object
        const product = {
          name: row.name.trim(),
          description: row.description ? String(row.description).trim() : "",
          price: price,
          category: categoryIds,
          stock: stock,
          image: row.image ? String(row.image).trim() : "",
          sku: row.sku ? String(row.sku).trim() : "",
          status: status, // ✅ Explicitly set status to active
          store: store._id,
        };

        products.push(product);
      } catch (rowError) {
        errors.push({
          row: rowNumber,
          message: rowError.message || "Error processing row",
        });
      }
    }

    // If there are validation errors and no valid products, return them
    if (errors.length > 0 && products.length === 0) {
      return res.status(400).json({
        message: "All rows have errors",
        errors,
      });
    }

    // Insert products in bulk
    let createdProducts = [];
    if (products.length > 0) {
      createdProducts = await ProductModel.insertMany(products, {
        ordered: false,
      });
    }

    return res.status(200).json({
      message: "Products created successfully",
      data: {
        created: createdProducts.length,
        categoriesCreated: createdCategories.length > 0 
          ? `Auto-created categories: ${createdCategories.join(", ")}` 
          : undefined,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};
// Export the multer middleware for use in routes
export const uploadExcel = upload.single("file");