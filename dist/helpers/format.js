"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.percentToDecimal = percentToDecimal;
exports.convertToNumber = convertToNumber;
exports.calculateEPS = calculateEPS;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
function percentToDecimal(input) {
    return input / 100;
}
function convertToNumber(value) {
    const [numberPart, unit] = value.split(" ");
    const number = new bignumber_js_1.default(numberPart.replace(/,/g, ""));
    switch (unit) {
        case "B":
            return number.multipliedBy(1e9);
        case "M":
            return number.multipliedBy(1e6);
        default:
            return number;
    }
}
function calculateEPS(outstanding_share, net_income) {
    const outstanding_share_ = convertToNumber(outstanding_share);
    const net_income_ = convertToNumber(net_income);
    return net_income_.dividedBy(outstanding_share_).toNumber();
}
