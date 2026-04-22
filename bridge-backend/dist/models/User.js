"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt = __importStar(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // This creates a unique index
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    profile: {
        name: { type: String, default: '' },
        dob: { type: Date },
        gender: {
            type: String,
            enum: ['man', 'woman', 'other'],
            default: 'man',
        },
        preferredGender: {
            type: String,
            enum: ['man', 'woman', 'everyone'],
            default: 'everyone',
        },
        location: {
            city: { type: String, default: '' },
            coordinates: { type: [Number], default: [0, 0] },
        },
        photos: [{ type: String }],
        bio: { type: String, default: '' },
        interests: [{ type: String }],
        prompts: [
            {
                question: { type: String },
                answer: { type: String },
            },
        ],
        height: { type: String, default: '' },
        education: { type: String, default: '' },
        relationshipGoal: {
            type: String,
            enum: ['casual', 'serious', 'dont_know'],
            default: 'dont_know',
        },
    },
    preferences: {
        ageMin: { type: Number, default: 18 },
        ageMax: { type: Number, default: 50 },
        maxDistance: { type: Number, default: 50 },
        distanceUnit: { type: String, enum: ['km', 'miles'], default: 'km' },
    },
    dailyLikes: {
        count: { type: Number, default: 0 },
        resetDate: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
}, {
    timestamps: true,
});
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map