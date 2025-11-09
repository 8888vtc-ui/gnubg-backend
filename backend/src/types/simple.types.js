"use strict";
/**
 * Types simplifiés pour éviter les conflits et rendre le développement plus rapide
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSubscriptionType = exports.SimpleUserRole = exports.SimpleDifficulty = exports.SimpleGameMode = exports.SimplePlayerColor = exports.SimpleGameStatus = void 0;
// Enums de base
var SimpleGameStatus;
(function (SimpleGameStatus) {
    SimpleGameStatus["WAITING"] = "waiting";
    SimpleGameStatus["PLAYING"] = "playing";
    SimpleGameStatus["COMPLETED"] = "completed";
})(SimpleGameStatus || (exports.SimpleGameStatus = SimpleGameStatus = {}));
var SimplePlayerColor;
(function (SimplePlayerColor) {
    SimplePlayerColor["WHITE"] = "white";
    SimplePlayerColor["BLACK"] = "black";
})(SimplePlayerColor || (exports.SimplePlayerColor = SimplePlayerColor = {}));
var SimpleGameMode;
(function (SimpleGameMode) {
    SimpleGameMode["PVP"] = "pvp";
    SimpleGameMode["PVC"] = "pvc";
})(SimpleGameMode || (exports.SimpleGameMode = SimpleGameMode = {}));
var SimpleDifficulty;
(function (SimpleDifficulty) {
    SimpleDifficulty["EASY"] = "easy";
    SimpleDifficulty["MEDIUM"] = "medium";
    SimpleDifficulty["HARD"] = "hard";
})(SimpleDifficulty || (exports.SimpleDifficulty = SimpleDifficulty = {}));
var SimpleUserRole;
(function (SimpleUserRole) {
    SimpleUserRole["USER"] = "user";
    SimpleUserRole["ADMIN"] = "admin";
})(SimpleUserRole || (exports.SimpleUserRole = SimpleUserRole = {}));
var SimpleSubscriptionType;
(function (SimpleSubscriptionType) {
    SimpleSubscriptionType["FREE"] = "free";
    SimpleSubscriptionType["PREMIUM"] = "premium";
})(SimpleSubscriptionType || (exports.SimpleSubscriptionType = SimpleSubscriptionType = {}));
//# sourceMappingURL=simple.types.js.map