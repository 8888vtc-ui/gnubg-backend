"use strict";
/**
 * Types fondamentaux pour le jeu de backgammon
 * Architecture propre et typée strictement
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Difficulty = exports.GameMode = exports.PlayerColor = exports.GameStatus = void 0;
// États du jeu
var GameStatus;
(function (GameStatus) {
    GameStatus["WAITING"] = "WAITING";
    GameStatus["PLAYING"] = "PLAYING";
    GameStatus["FINISHED"] = "FINISHED";
    GameStatus["PAUSED"] = "PAUSED";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
var PlayerColor;
(function (PlayerColor) {
    PlayerColor["WHITE"] = "WHITE";
    PlayerColor["BLACK"] = "BLACK";
})(PlayerColor || (exports.PlayerColor = PlayerColor = {}));
var GameMode;
(function (GameMode) {
    GameMode["PLAYER_VS_PLAYER"] = "PLAYER_VS_PLAYER";
    GameMode["PLAYER_VS_AI"] = "PLAYER_VS_AI";
    GameMode["AI_VS_AI"] = "AI_VS_AI";
})(GameMode || (exports.GameMode = GameMode = {}));
var Difficulty;
(function (Difficulty) {
    Difficulty["EASY"] = "EASY";
    Difficulty["MEDIUM"] = "MEDIUM";
    Difficulty["HARD"] = "HARD";
    Difficulty["EXPERT"] = "EXPERT";
})(Difficulty || (exports.Difficulty = Difficulty = {}));
//# sourceMappingURL=game.types.js.map