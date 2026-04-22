"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const matchController_1 = require("../controllers/matchController");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, matchController_1.reportUser);
router.post('/block/:userId', auth_1.authenticate, matchController_1.blockUser);
exports.default = router;
//# sourceMappingURL=reports.js.map