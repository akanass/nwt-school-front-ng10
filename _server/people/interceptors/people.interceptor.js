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
exports.PeopleInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let PeopleInterceptor = class PeopleInterceptor {
    constructor(_logger) {
        this._logger = _logger;
    }
    intercept(context, next) {
        const cls = context.getClass();
        const handler = context.getHandler();
        const response = context.switchToHttp().getResponse();
        const logCtx = `PeopleInterceptor => ${cls.name}.${handler.name}`;
        return next.handle()
            .pipe(operators_1.map(_ => rxjs_1.of(_)), operators_1.mergeMap((obs) => rxjs_1.merge(obs
            .pipe(operators_1.filter(_ => !!_), operators_1.map(_ => _)), obs
            .pipe(operators_1.filter(_ => !_), operators_1.tap(_ => response.status(204)), operators_1.map(_ => _)))), operators_1.tap(_ => this._logger.log(!!_ ? _ : 'NO CONTENT', logCtx), _ => this._logger.error(_.message, JSON.stringify(_), logCtx)));
    }
};
PeopleInterceptor = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [common_1.Logger])
], PeopleInterceptor);
exports.PeopleInterceptor = PeopleInterceptor;
