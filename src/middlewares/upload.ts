import multer from "multer";

const storage = multer.memoryStorage();
export const uploadMutler = multer({ storage: storage });
