module.exports = [
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/RescueBite/RescueBite/src/prisma/contract.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"schemaVersion":"1","targetFamily":"sql","target":"postgres","profileHash":"3916f444a8a17ad749191acf9e08dad97d1a327b88c2f1d45d12f240296aa8b2","roots":{"post":{"model":"Post","namespace":"public"},"user":{"model":"User","namespace":"public"}},"domain":{"namespaces":{"public":{"models":{"Post":{"fields":{"authorId":{"nullable":false,"type":{"codecId":"pg/int4@1","kind":"scalar"}},"content":{"nullable":true,"type":{"codecId":"pg/text@1","kind":"scalar"}},"createdAt":{"nullable":false,"type":{"codecId":"pg/timestamptz-string@1","kind":"scalar"}},"id":{"nullable":false,"type":{"codecId":"pg/int4@1","kind":"scalar"}},"title":{"nullable":false,"type":{"codecId":"pg/text@1","kind":"scalar"}},"updatedAt":{"nullable":false,"type":{"codecId":"pg/timestamptz-string@1","kind":"scalar"}}},"relations":{"author":{"cardinality":"N:1","on":{"localFields":["authorId"],"targetFields":["id"]},"to":{"model":"User","namespace":"public"}}},"storage":{"fields":{"authorId":{"column":"authorId"},"content":{"column":"content"},"createdAt":{"column":"createdAt"},"id":{"column":"id"},"title":{"column":"title"},"updatedAt":{"column":"updatedAt"}},"namespaceId":"public","table":"post"}},"User":{"fields":{"createdAt":{"nullable":false,"type":{"codecId":"pg/timestamptz-string@1","kind":"scalar"}},"email":{"nullable":false,"type":{"codecId":"pg/text@1","kind":"scalar"}},"id":{"nullable":false,"type":{"codecId":"pg/int4@1","kind":"scalar"}},"name":{"nullable":true,"type":{"codecId":"pg/text@1","kind":"scalar"}},"updatedAt":{"nullable":false,"type":{"codecId":"pg/timestamptz-string@1","kind":"scalar"}},"username":{"nullable":true,"type":{"codecId":"pg/text@1","kind":"scalar"}}},"relations":{"posts":{"cardinality":"1:N","on":{"localFields":["id"],"targetFields":["authorId"]},"to":{"model":"Post","namespace":"public"}}},"storage":{"fields":{"createdAt":{"column":"createdAt"},"email":{"column":"email"},"id":{"column":"id"},"name":{"column":"name"},"updatedAt":{"column":"updatedAt"},"username":{"column":"username"}},"namespaceId":"public","table":"user"}}}}}},"storage":{"namespaces":{"public":{"entries":{"table":{"post":{"columns":{"authorId":{"codecId":"pg/int4@1","nativeType":"int4","nullable":false},"content":{"codecId":"pg/text@1","nativeType":"text","nullable":true},"createdAt":{"codecId":"pg/timestamptz-string@1","default":{"expression":"now()","kind":"function"},"nativeType":"timestamptz","nullable":false},"id":{"codecId":"pg/int4@1","default":{"expression":"autoincrement()","kind":"function"},"nativeType":"int4","nullable":false},"title":{"codecId":"pg/text@1","nativeType":"text","nullable":false},"updatedAt":{"codecId":"pg/timestamptz-string@1","nativeType":"timestamptz","nullable":false}},"foreignKeys":[{"source":{"columns":["authorId"],"namespaceId":"public","tableName":"post"},"target":{"columns":["id"],"namespaceId":"public","tableName":"user"}}],"indexes":[{"columns":["authorId"],"name":"post_authorId_idx_e47547ed","prefix":"post_authorId_idx","unique":false}],"primaryKey":{"columns":["id"]},"uniques":[]},"user":{"columns":{"createdAt":{"codecId":"pg/timestamptz-string@1","default":{"expression":"now()","kind":"function"},"nativeType":"timestamptz","nullable":false},"email":{"codecId":"pg/text@1","nativeType":"text","nullable":false},"id":{"codecId":"pg/int4@1","default":{"expression":"autoincrement()","kind":"function"},"nativeType":"int4","nullable":false},"name":{"codecId":"pg/text@1","nativeType":"text","nullable":true},"updatedAt":{"codecId":"pg/timestamptz-string@1","nativeType":"timestamptz","nullable":false},"username":{"codecId":"pg/text@1","nativeType":"text","nullable":true}},"foreignKeys":[],"indexes":[],"primaryKey":{"columns":["id"]},"uniques":[{"columns":["email"]}]}}},"id":"public","kind":"postgres-schema"}},"storageHash":"1e8412e162dbbe69f4bb3bf8d07f0280ae67eaab15c34dcf201e67468315428d"},"execution":{"executionHash":"4abff323cc88151ef9c9a0ec90122cfee6d46814a118cdb66a9fdd94a4123463","mutations":{"defaults":[{"onCreate":{"id":"timestampNow","kind":"generator"},"onUpdate":{"id":"timestampNow","kind":"generator"},"ref":{"column":"updatedAt","namespace":"public","table":"post"}},{"onCreate":{"id":"timestampNow","kind":"generator"},"onUpdate":{"id":"timestampNow","kind":"generator"},"ref":{"column":"updatedAt","namespace":"public","table":"user"}}]}},"capabilities":{"postgres":{"distinctOn":true,"jsonAgg":true,"lateral":true,"limit":true,"orderBy":true,"returning":true},"sql":{"checkConstraint":true,"defaultInInsert":true,"enums":true,"lateral":true,"returning":true,"scalarList":true}},"extensions":{},"meta":{},"_generated":{"warning":"⚠️  GENERATED FILE - DO NOT EDIT","message":"This file is automatically generated by \"prisma contract emit\".","regenerate":"To regenerate, run: prisma contract emit"}});}),
"[project]/RescueBite/RescueBite/src/prisma/composer.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "appContract",
    ()=>appContract
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/@prisma/composer-prisma-cloud/dist/orm.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2d$postgres$2d$ChW2Ewj7$2d$Dnas0G3L$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__n__as__dataContract$3e$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/@prisma/composer-prisma-cloud/dist/orm-postgres-ChW2Ewj7-Dnas0G3L.mjs [app-rsc] (ecmascript) <export n as dataContract>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$contract$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/src/prisma/contract.json (json)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2d$postgres$2d$ChW2Ewj7$2d$Dnas0G3L$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__n__as__dataContract$3e$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2d$postgres$2d$ChW2Ewj7$2d$Dnas0G3L$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__n__as__dataContract$3e$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const appContract = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2d$postgres$2d$ChW2Ewj7$2d$Dnas0G3L$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__n__as__dataContract$3e$__["dataContract"])(__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$contract$2e$json__$28$json$29$__["default"]);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/RescueBite/RescueBite/service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2f$dist$2f$nextjs$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/@prisma/composer/dist/nextjs.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/@prisma/composer-prisma-cloud/dist/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/@prisma/composer-prisma-cloud/dist/orm.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2d$postgres$2d$ChW2Ewj7$2d$Dnas0G3L$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__i__as__postgres$3e$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/@prisma/composer-prisma-cloud/dist/orm-postgres-ChW2Ewj7-Dnas0G3L.mjs [app-rsc] (ecmascript) <export i as postgres>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$composer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/src/prisma/composer.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2d$postgres$2d$ChW2Ewj7$2d$Dnas0G3L$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__i__as__postgres$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$composer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2d$postgres$2d$ChW2Ewj7$2d$Dnas0G3L$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__i__as__postgres$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$composer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
const __TURBOPACK__import$2e$meta__ = {
    get url () {
        return `file://${__turbopack_context__.P("RescueBite/RescueBite/service.ts")}`;
    }
};
;
;
;
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["compute"])({
    name: "app",
    deps: {
        database: (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2d$prisma$2d$cloud$2f$dist$2f$orm$2d$postgres$2d$ChW2Ewj7$2d$Dnas0G3L$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__i__as__postgres$3e$__["postgres"])(__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$composer$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appContract"])
    },
    build: (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$composer$2f$dist$2f$nextjs$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])({
        module: __TURBOPACK__import$2e$meta__.url,
        appDir: "."
    })
});
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/RescueBite/RescueBite/src/prisma/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "connectDatabase",
    ()=>connectDatabase,
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$orm$2d$postgres$2f$dist$2f$runtime$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/@prisma/orm-postgres/dist/runtime.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$temporal$2d$polyfill$2f$global$2e$esm$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/temporal-polyfill/global.esm.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/service.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$contract$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/src/prisma/contract.json (json)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$orm$2d$postgres$2f$dist$2f$runtime$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$orm$2d$postgres$2f$dist$2f$runtime$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
function loadComposerDatabase() {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].load().database.client;
    } catch  {
        return undefined;
    }
}
const db = loadComposerDatabase() ?? (process.env.DATABASE_URL ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$orm$2d$postgres$2f$dist$2f$runtime$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    contractJson: __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$contract$2e$json__$28$json$29$__["default"],
    url: process.env.DATABASE_URL
}) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f40$prisma$2f$orm$2d$postgres$2f$dist$2f$runtime$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    contractJson: __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$contract$2e$json__$28$json$29$__["default"]
}));
let connection;
function connectDatabase() {
    connection ??= db.connect().then(()=>undefined).catch((error)=>{
        connection = undefined;
        throw error;
    });
    return connection;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/RescueBite/RescueBite/src/prisma/seed.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "seed",
    ()=>seed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/src/prisma/db.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const users = [
    {
        email: "alice@prisma.io",
        username: "alice",
        name: "Alice"
    },
    {
        email: "bob@prisma.io",
        username: "bob",
        name: "Bob"
    },
    {
        email: "carol@prisma.io",
        username: "carol",
        name: "Carol"
    }
];
let pendingSeed;
async function runSeed() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["connectDatabase"])();
    for (const user of users){
        await __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].orm.public.User.upsert({
            create: user,
            update: {},
            conflictOn: {
                email: user.email
            }
        });
    }
}
function seed() {
    pendingSeed ??= runSeed().catch((error)=>{
        pendingSeed = undefined;
        throw error;
    });
    return pendingSeed;
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/RescueBite/RescueBite/src/prisma/users.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "listUsers",
    ()=>listUsers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/src/prisma/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$seed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/src/prisma/seed.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$seed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$seed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
async function listUsers(limit = 10) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$seed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["seed"])();
    const users = await __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].orm.public.User.select("id", "email", "username", "name", "createdAt").limit(limit).all();
    return users.map((user)=>({
            id: String(user.id),
            email: user.email,
            username: user.username ?? null,
            name: user.name ?? null,
            createdAt: user.createdAt
        }));
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/RescueBite/RescueBite/src/prisma/users.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "db",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"],
    "listUsers",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["listUsers"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/src/prisma/users.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/src/prisma/db.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$src$2f$prisma$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__26cdb9b6._.js.map