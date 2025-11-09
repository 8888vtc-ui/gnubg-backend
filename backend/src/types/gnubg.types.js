"use strict";
/**
 * Types pour l'intégration GNUBG (GNU Backgammon)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePhase = exports.AnalysisType = void 0;
var AnalysisType;
(function (AnalysisType) {
    AnalysisType["QUICK"] = "quick";
    AnalysisType["FULL"] = "full";
    AnalysisType["EVALUATION"] = "evaluation";
    AnalysisType["BEST_MOVE"] = "best_move";
    AnalysisType["BEST_MOVES"] = "best_moves";
    AnalysisType["MOVE_ANALYSIS"] = "move_analysis";
})(AnalysisType || (exports.AnalysisType = AnalysisType = {}));
var GamePhase;
(function (GamePhase) {
    GamePhase["OPENING"] = "opening";
    GamePhase["MIDDLEGAME"] = "middlegame";
    GamePhase["ENDGAME"] = "endgame";
    GamePhase["BEAROFF"] = "bearoff";
})(GamePhase || (exports.GamePhase = GamePhase = {}));
//# sourceMappingURL=gnubg.types.js.map