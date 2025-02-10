"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = void 0;
const index_1 = require("../db/index");
const getProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield index_1.postgresPool.connect();
    try {
        const res = yield client.query("SELECT * FROM products");
        return res.rows.map((row) => ({
            id: row.id,
            name: row.name || "Unknown", // handle null value for name
            price: row.price,
            example: row.example, // handle null value for example
        }));
    }
    finally {
        client.release();
    }
});
exports.getProducts = getProducts;
