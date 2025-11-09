"use strict";
/**
 * Index des types - Export centralisé
 */
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionType = exports.UserRole = exports.GamePhase = exports.AnalysisType = void 0;
// Types du jeu
__exportStar(require("./game.types"), exports);
var gnubg_types_1 = require("./gnubg.types");
Object.defineProperty(exports, "AnalysisType", { enumerable: true, get: function () { return gnubg_types_1.AnalysisType; } });
Object.defineProperty(exports, "GamePhase", { enumerable: true, get: function () { return gnubg_types_1.GamePhase; } });
// Types pour les services
__exportStar(require("./service.types"), exports);
var auth_types_1 = require("./auth.types");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return auth_types_1.UserRole; } });
Object.defineProperty(exports, "SubscriptionType", { enumerable: true, get: function () { return auth_types_1.SubscriptionType; } });
//# sourceMappingURL=index.js.map