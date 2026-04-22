"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const discoveryController_1 = require("../controllers/discoveryController");
const router = (0, express_1.Router)();
router.get('/feed', auth_1.authenticate, discoveryController_1.getDiscoveryFeed);
router.post('/swipe', auth_1.authenticate, discoveryController_1.swipeUser);
router.put('/filters', auth_1.authenticate, discoveryController_1.updateFilters);
exports.default = router;
//# sourceMappingURL=discovery.js.map