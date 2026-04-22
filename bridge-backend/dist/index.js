"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api', routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join_room', (matchId) => {
        socket.join(matchId);
        console.log(`User ${socket.id} joined room ${matchId}`);
    });
    socket.on('leave_room', (matchId) => {
        socket.leave(matchId);
    });
    socket.on('send_message', (data) => {
        socket.to(data.matchId).emit('receive_message', data.message);
    });
    socket.on('typing_start', (data) => {
        socket.to(data.matchId).emit('typing_start', { userId: data.userId });
    });
    socket.on('typing_stop', (data) => {
        socket.to(data.matchId).emit('typing_stop', { userId: data.userId });
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
const PORT = process.env.API_PORT || '3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bridge';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map