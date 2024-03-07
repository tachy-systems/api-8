const chai = require("../src/node_modules/chai");
const expect = chai.expect;
const app = require("../src/index.js");
const lambdaTester = require("../src/node_modules/lambda-tester/lib");

const fs = require("fs");
let path = require("path");

let testCases = fs.readdirSync("../unitTesting/testCases");
console.log(testCases);
const AWSXRayCore = require("aws-xray-sdk-core");
if (!process.env.IS_OFFLINE) {
  AWSXRayCore.captureHTTPsGlobal(require("http"));
}

describe("Meta info be api automated unit test results:", () => {
  for (
    let testCaseIndex = 0;
    testCaseIndex < testCases.length;
    testCaseIndex++
  ) {
    let filePath = path.join(
      __dirname,
      `../unitTesting/testCases/testCase_${testCaseIndex + 1}.json`
    );
    let data = fs.readFileSync(filePath, { encoding: "utf-8" });
    let {
      testCaseNumber,
      event,
      test: testAttributes,
      description,
    } = JSON.parse(data);
    console.log(("testAttributes: ", testAttributes));
    event.body = JSON.stringify(event.body);
    it(description, async () => {
      const result = await lambdaTester(app.handler)
        .event(event)
        .expectResult();
      expect(testCaseNumber).to.equal(testCaseIndex + 1);

      if (testAttributes.statusCode < 400) {
        expect(result.context.code).to.equal(testAttributes.responseCode);
      } else {
        expect(result.context.code).to.equal(testAttributes.responseCode);
      }
    });
  }
});
