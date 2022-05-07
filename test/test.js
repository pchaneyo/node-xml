"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xml_1 = __importDefault(require("../lib/xml"));
console.log(xml_1.default([{ a: {} }]));
console.log(xml_1.default([{ a: [{ b: [{ c: 1 }, { c: 2 }, { c: 3 }] }] }], true));
