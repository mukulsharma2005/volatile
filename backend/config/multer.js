import multer, { memoryStorage } from "multer";
const upload = multer({
    storage: memoryStorage(),
    limits: {fileSize: 5* 1024 *1024},
})
export {upload};