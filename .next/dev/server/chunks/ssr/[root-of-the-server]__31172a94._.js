module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/RescueBite/RescueBite/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/RescueBite/RescueBite/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/RescueBite/RescueBite/src/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/RescueBite/RescueBite/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
const dynamic = "force-dynamic";
async function Home() {
    const { listUsers } = await __turbopack_context__.A("[project]/RescueBite/RescueBite/src/prisma/users.ts [app-rsc] (ecmascript, async loader)");
    const formatter = new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short"
    });
    const users = await listUsers(10).catch(()=>undefined);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "shell",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hero",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "eyebrow",
                        children: "Next.js + Prisma 8"
                    }, void 0, false, {
                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                        lineNumber: 15,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        children: "Users from your database, loaded on the server."
                    }, void 0, false, {
                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                        lineNumber: 17,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "lede",
                        children: [
                            "This page reads from ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: "src/app/page.tsx"
                            }, void 0, false, {
                                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                lineNumber: 19,
                                columnNumber: 32
                            }, this),
                            " using the Prisma 8 helper in",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: "src/prisma/users.ts"
                            }, void 0, false, {
                                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                lineNumber: 20,
                                columnNumber: 11
                            }, this),
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "panel",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panelHeader",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: "Seeded users"
                            }, void 0, false, {
                                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                lineNumber: 26,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    users?.length ?? 0,
                                    " total"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    !users ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "empty",
                        children: [
                            "Could not query users yet. Run ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                children: "contract:emit"
                            }, void 0, false, {
                                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                lineNumber: 32,
                                columnNumber: 44
                            }, this),
                            " and apply your schema, then refresh."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                        lineNumber: 31,
                        columnNumber: 11
                    }, this) : users.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "empty",
                        children: "No users found."
                    }, void 0, false, {
                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                        lineNumber: 36,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: "users",
                        children: users.map((user)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: user.name ?? "Unnamed user"
                                            }, void 0, false, {
                                                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                                lineNumber: 42,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: user.username ? `@${user.username}` : user.email
                                            }, void 0, false, {
                                                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                                lineNumber: 43,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                        lineNumber: 41,
                                        columnNumber: 17
                                    }, this),
                                    user.createdAt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("time", {
                                        dateTime: user.createdAt,
                                        children: formatter.format(new Date(user.createdAt))
                                    }, void 0, false, {
                                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                        lineNumber: 46,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$RescueBite$2f$RescueBite$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "empty",
                                        children: "No timestamp"
                                    }, void 0, false, {
                                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                        lineNumber: 50,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, user.id, true, {
                                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                                lineNumber: 40,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/RescueBite/RescueBite/src/app/page.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
}),
"[project]/RescueBite/RescueBite/src/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/RescueBite/RescueBite/src/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__31172a94._.js.map