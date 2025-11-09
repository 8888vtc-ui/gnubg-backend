"use strict";
/**
 * Types pour l'authentification et la gestion utilisateur
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["PLAYER"] = "PLAYER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MODERATOR"] = "MODERATOR";
})(UserRole || (exports.UserRole = UserRole = {}));
var SubscriptionType;
(function (SubscriptionType) {
    SubscriptionType["FREE"] = "FREE";
    SubscriptionType["PREMIUM"] = "PREMIUM";
    SubscriptionType["PRO"] = "PRO";
})(SubscriptionType || (exports.SubscriptionType = SubscriptionType = {}));
//# sourceMappingURL=auth.types.js.map