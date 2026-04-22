"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const discovery_1 = __importDefault(require("./discovery"));
const matches_1 = __importDefault(require("./matches"));
const messages_1 = __importDefault(require("./messages"));
const reports_1 = __importDefault(require("./reports"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/users', users_1.default);
router.use('/discovery', discovery_1.default);
router.use('/matches', matches_1.default);
router.use('/messages', messages_1.default);
router.use('/reports', reports_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map