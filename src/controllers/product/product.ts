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
import { StoreBranchModel } from "../../schemas/store/store_branch";
import { SectionModel } from "../../schemas/section";
import { ProductItemModel } from "../../schemas/product/product_item";

export const getStoreProducts = async (
  req: express.Request,
  res: express.Response,
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
  res: express.Response,
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
  res: express.Response,
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
  res: express.Response,
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
  res: express.Response,
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
      { upsert: true },
    );

    return res.status(200).json(success_msg("Product updated")).end();
  } catch (error) {
    Logger.error(error);
    return res.status(406).send({ message: error.message || ERRORS.SERVER });
  }
};

export const deleteStoreProduct = async (
  req: express.Request,
  res: express.Response,
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
  res: express.Response,
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

    // Parse Excel file with UTF-8 encoding support for Arabic text
    const workbook = XLSX.read(file.buffer, {
      type: "buffer",
      codepage: 65001,
      cellText: false,
      cellDates: true,
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: "",
    });

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const productsToCreate = [];
    const productsToUpdate = [];
    const errors = [];
    const createdCategories: string[] = [];
    const createdBranches: string[] = []; // Track auto-created branches

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

        // Check if this is an update operation (row has id field)
        const isUpdate = row.id && String(row.id).trim().length > 0;
        let existingProduct = null;

        if (isUpdate) {
          existingProduct = await ProductModel.findOne({
            _id: row.id,
            store: store._id,
          });

          if (!existingProduct) {
            errors.push({
              row: rowNumber,
              message: `Product with ID ${row.id} not found`,
            });
            continue;
          }
        }

        // ========================================
        // CATEGORY HANDLING
        // ========================================
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

        let categories = await CategoryModel.find({
          name: { $in: categoryNames },
          store: store._id,
        }).select("_id name");

        const foundCategoryNames = categories.map((c) => c.name);
        const missingCategories = categoryNames.filter(
          (name) => !foundCategoryNames.includes(name),
        );

        if (missingCategories.length > 0) {
          const newCategories = await CategoryModel.insertMany(
            missingCategories.map((name) => ({
              name: name,
              store: store._id,
              status: "active",
            })),
          );

          createdCategories.push(...missingCategories);
          categories = [...categories, ...newCategories];
        }

        const categoryIds = categories.map((c) => c._id);

        // ========================================
        // BRANCH HANDLING (supports comma-separated branches)
        // ========================================
        let branchIds: any[] = [];

        if (row.branch) {
          // Parse branch names (supports single or comma-separated)
          let branchNames: string[];
          if (typeof row.branch === "string") {
            branchNames = row.branch
              .split(",")
              .map((b: string) => b.trim())
              .filter((b: string) => b.length > 0);
          } else if (Array.isArray(row.branch)) {
            branchNames = row.branch
              .map((b: any) => String(b).trim())
              .filter((b: string) => b.length > 0);
          } else {
            branchNames = [String(row.branch).trim()];
          }

          if (branchNames.length > 0) {
            // Find existing branches
            let branches = await StoreBranchModel.find({
              name: { $in: branchNames },
              store: store._id,
            }).select("_id name");

            const foundBranchNames = branches.map((b) => b.name);
            const missingBranches = branchNames.filter(
              (name) => !foundBranchNames.includes(name),
            );

            // Auto-create missing branches
            if (missingBranches.length > 0) {
              // Check if phone_number is required - use a default or get from Excel
              const defaultPhoneNumber = row.branch_phone || "0000000000"; // You can customize this

              const newBranches = await StoreBranchModel.insertMany(
                missingBranches.map((name) => ({
                  name: name,
                  store: store._id,
                  phone_number: defaultPhoneNumber, // Required field
                  address: row.branch_address || "", // Optional from Excel
                  display_cart: true, // Default value
                })),
              );

              createdBranches.push(...missingBranches);
              branches = [...branches, ...newBranches];
            }

            branchIds = branches.map((b) => b._id);
          }
        }

        // ========================================
        // SECTION HANDLING (supports comma-separated sections)
        // ========================================
        let sectionIds: any[] = [];

        if (row.section) {
          let sectionNames: string[];
          if (typeof row.section === "string") {
            sectionNames = row.section
              .split(",")
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0);
          } else if (Array.isArray(row.section)) {
            sectionNames = row.section
              .map((s: any) => String(s).trim())
              .filter((s: string) => s.length > 0);
          } else {
            sectionNames = [String(row.section).trim()];
          }

          if (sectionNames.length > 0) {
            const sections = await SectionModel.find({
              name: { $in: sectionNames },
              store: store._id,
            }).select("_id name");

            sectionIds = sections.map((s) => s._id);
          }
        }

        // ========================================
        // ADDITIONS HANDLING (format: group|name|items|is_multiple)
        // ========================================
        let additions: any[] = [];

        if (row.additions) {
          try {
            // Parse additions - expected format: "group1|name1|item1+item2|true,group2|name2|item3|false"
            let additionsStr: string;
            if (typeof row.additions === "string") {
              additionsStr = row.additions.trim();
            } else {
              additionsStr = String(row.additions).trim();
            }

            if (additionsStr.length > 0) {
              const additionGroups = additionsStr
                .split(",")
                .map((a: string) => a.trim())
                .filter((a: string) => a.length > 0);

              for (const additionStr of additionGroups) {
                const parts = additionStr.split("|").map((p: string) => p.trim());

                if (parts.length < 3) {
                  errors.push({
                    row: rowNumber,
                    message: `Invalid addition format in "${additionStr}". Expected: group|name|items|is_multiple`,
                  });
                  continue;
                }

                const [group, name, itemsStr, isMultipleStr] = parts;

                // Parse item names (plus-sign separated)
                const itemNames = itemsStr
                  .split("+")
                  .map((i: string) => i.trim())
                  .filter((i: string) => i.length > 0);

                if (itemNames.length === 0) {
                  errors.push({
                    row: rowNumber,
                    message: `No items specified for addition "${name}" in group "${group}"`,
                  });
                  continue;
                }

                // Find or create product items
                let items = await ProductItemModel.find({
                  name: { $in: itemNames },
                  store: store._id,
                }).select("_id name");

                const foundItemNames = items.map((i) => i.name);
                const missingItems = itemNames.filter(
                  (name) => !foundItemNames.includes(name),
                );

                // Auto-create missing product items with default price 0
                if (missingItems.length > 0) {
                  const newItems = await ProductItemModel.insertMany(
                    missingItems.map((itemName) => ({
                      name: itemName,
                      store: store._id,
                      additional_price: 0,
                      image: "",
                    })),
                  );
                  items = [...items, ...newItems];
                }

                const itemIds = items.map((i) => i._id);

                // Parse is_multiple flag (default: false)
                const isMultiple =
                  isMultipleStr?.toLowerCase() === "true" ||
                  isMultipleStr === "1";

                additions.push({
                  group: group,
                  name: name,
                  items: itemIds,
                  is_multiple: isMultiple,
                });
              }
            }
          } catch (additionError) {
            errors.push({
              row: rowNumber,
              message: `Error parsing additions: ${additionError.message}`,
            });
            continue;
          }
        }

        // ========================================
        // VALIDATION & PRODUCT PREPARATION
        // ========================================
        const price = parseFloat(row.price);
        if (isNaN(price) || price < 0) {
          errors.push({
            row: rowNumber,
            message: "Invalid price value",
          });
          continue;
        }

        const stock = parseInt(row.stock) || 0;
        if (stock < 0) {
          errors.push({
            row: rowNumber,
            message: "Stock cannot be negative",
          });
          continue;
        }

        const is_active =
          row.status?.toLowerCase() === "inactive" ? false : true;

        // Prepare product object
        const productData = {
          name: String(row.name || "").trim(),
          description: row.description ? String(row.description).trim() : "",
          notes: row.notes ? String(row.notes).trim() : "",
          price: price,
          category: categoryIds,
          branch: branchIds.length > 0 ? branchIds : undefined, // Only add if branches exist
          images: row.image ? [String(row.image).trim()] : [],
          section: sectionIds.length > 0 ? sectionIds : undefined,
          additions: additions.length > 0 ? additions : undefined,
          is_active: is_active,
          store: store._id,
        };

        if (isUpdate) {
          productsToUpdate.push({
            id: row.id,
            data: productData,
          });
        } else {
          productsToCreate.push(productData);
        }
      } catch (rowError) {
        errors.push({
          row: rowNumber,
          message: rowError.message || "Error processing row",
        });
      }
    }

    // If there are validation errors and no valid products, return them
    if (errors.length > 0 && productsToCreate.length === 0 && productsToUpdate.length === 0) {
      return res.status(400).json({
        message: "All rows have errors",
        errors,
      });
    }

    // Insert new products in bulk
    let createdProducts = [];
    if (productsToCreate.length > 0) {
      createdProducts = await ProductModel.insertMany(productsToCreate, {
        ordered: false,
      });
    }

    // Update existing products
    let updatedCount = 0;
    for (const product of productsToUpdate) {
      await ProductModel.updateOne(
        { _id: product.id, store: store._id },
        { $set: product.data }
      );
      updatedCount++;
    }

    return res.status(200).json({
      message: "Products processed successfully",
      data: {
        created: createdProducts.length,
        updated: updatedCount,
        categoriesCreated:
          createdCategories.length > 0
            ? `Auto-created categories: ${createdCategories.join(", ")}`
            : undefined,
        branchesCreated:
          createdBranches.length > 0
            ? `Auto-created branches: ${createdBranches.join(", ")}`
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
