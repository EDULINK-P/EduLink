import { transform } from "@babel/core";

export default {
    transform: { "^.+\\.js$": `babel-jest`},
    testEnvironment: "node",
}
