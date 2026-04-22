"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const matchController_1 = require("../controllers/matchController");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, matchController_1.getMatches);
router.get('/:matchId', auth_1.authenticate, matchController_1.getMatchById);
router.delete('/:matchId', auth_1.authenticate, matchController_1.unmatch);
exports.default = router;
//# sourceMappingURL=matches.js.map