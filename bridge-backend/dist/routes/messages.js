"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const messageController_1 = require("../controllers/messageController");
const router = (0, express_1.Router)();
router.get('/:matchId', auth_1.authenticate, messageController_1.getMessages);
router.post('/:matchId', auth_1.authenticate, messageController_1.sendMessage);
router.put('/:matchId/:messageId/read', auth_1.authenticate, messageController_1.markAsRead);
router.put('/:matchId/:messageId/reaction', auth_1.authenticate, messageController_1.addReaction);
exports.default = router;
//# sourceMappingURL=messages.js.map