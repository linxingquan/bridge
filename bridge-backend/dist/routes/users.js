"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controllers/userController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.user?._id?.toString() || 'temp';
        const dir = path_1.default.join(__dirname, '../../uploads', `${userId}_photos`);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `${timestamp}_${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
router.put('/profile', auth_1.authenticate, userController_1.updateProfile);
router.get('/profile/:userId', auth_1.authenticate, userController_1.getProfile);
router.post('/deactivate', auth_1.authenticate, userController_1.deactivateAccount);
router.delete('/account', auth_1.authenticate, userController_1.deleteAccount);
router.post('/photos', auth_1.authenticate, upload.single('photo'), userController_1.uploadPhoto);
router.delete('/photos', auth_1.authenticate, userController_1.deletePhoto);
exports.default = router;
//# sourceMappingURL=users.js.map