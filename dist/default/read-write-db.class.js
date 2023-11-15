"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = require("mysql2");
const data_source_factory_class_1 = require("../factory/data-source-factory.class");
const core_decorator_1 = require("../core.decorator");
const typespeed_1 = require("../typespeed");
class ReadWriteDb extends data_source_factory_class_1.default {
    getDataSource() {
        if (!(0, typespeed_1.config)("mysql")) {
            return null;
        }
        return new ReadWriteDb();
    }
    constructor() {
        super();
        const dbConfig = (0, typespeed_1.config)("mysql");
        if (dbConfig["master"] && dbConfig["slave"]) {
            this.writeSession = this.getConnectionByConfig(dbConfig["master"]);
            if (Array.isArray(dbConfig["slave"])) {
                this.readSession = dbConfig["slave"].map(config => this.getConnectionByConfig(config));
            }
            else {
                this.readSession = [this.getConnectionByConfig(dbConfig["slave"])];
            }
        }
        else {
            this.writeSession = this.getConnectionByConfig(dbConfig);
            this.readSession = [this.writeSession];
        }
    }
    getConnectionByConfig(config) {
        if (config["PoolOptions"] !== undefined) {
            // we need pool
            if (Object.keys(config["PoolOptions"]).length !== 0) {
                config = Object.assign(config, config["PoolOptions"]);
            }
            return (0, mysql2_1.createPool)(config).promise();
        }
        else {
            // only connection
            return (0, mysql2_1.createConnection)(config).promise();
        }
    }
    readConnection() {
        return this.readSession[Math.floor(Math.random() * this.readSession.length)];
    }
    writeConnection() {
        return this.writeSession;
    }
}
__decorate([
    core_decorator_1.bean,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", data_source_factory_class_1.default)
], ReadWriteDb.prototype, "getDataSource", null);
exports.default = ReadWriteDb;
