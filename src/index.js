const {
  httpResponses: HTTP_RESPONSES,
} = require("../../../../../../pipeline-requirements/httpResponses");
const AWS_REGION = process.env.AWS_REGION || "ap-southeast-2";
const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const { customers } = require("../../../../../../pipeline-requirements/Schema/customers");

const dynamoDbTablePK = process.env.DYNAMODB_PK;
const dynamoDbTableSK = process.env.DYNAMODB_SK;

const DEFAULT_APP_ANDROID = "ANDROID";
const DEFAULT_APP_IOS = "IOS";
const DEFAULT_APP_REGION = "au";
const DEFAULT_APP_CONSUMER = "TalkSite";

// ---------------------------------------------------------------------------------------------------------------------------------

//Dynamodb configs
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: false, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

const translateConfig = { marshallOptions, unmarshallOptions };

const ddbClient = new DynamoDBClient({ region: AWS_REGION });

// Create the DynamoDB Document client.
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig);

// ---------------------------------------------------------------------------------------------------------------------------------

//Xray configs
const AWSXRayCore = require("aws-xray-sdk-core");
//Capture dynamodb calls in xray logs
AWSXRayCore.captureAWSv3Client(ddbClient);

// ---------------------------------------------------------------------------------------------------------------------------------

const ResponseBuilder = async (response) => {
  const segment = AWSXRayCore.getSegment();
  const subsegment = segment.addNewSubsegment("ResponseBuilder");
  let headers = {};

  headers = {
    ...headers,
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };

  let body = {
    ...response.body,
  };

  subsegment.close();
  return {
    statusCode: response.statusCode,
    body: JSON.stringify(body),
    headers,
  };
};

const ResponseBuilderExtended = (response, data) => {
  const segment = AWSXRayCore.getSegment();
  const subsegment = segment.addNewSubsegment("ResponseBuilderExtended");
  let body = {
    ...response.body,
    data,
  };

  if (data.error) {
    response.body.detail = data.error;
    response.body.message = data?.message;
    body = { ...response.body };
  }

  subsegment.close();
  return {
    statusCode: response.statusCode,
    body,
  };
};

exports.handler = async (event) => {
  const segment = AWSXRayCore.getSegment();
  const subsegment = segment.addNewSubsegment("handler");

  try {
    console.log(" entry ", event);
    const response = await dispatcher(event);
    subsegment.close();
    segment.close();
    return response;
  } catch (error) {
    console.log("exports.handler - exception", error);
    subsegment.close();
    segment.close();
    return ResponseBuilder(HTTP_RESPONSES["INTERNAL_SERVER_ERROR"]);
  }
};

const dispatcher = async (request) => {
  const segment = AWSXRayCore.getSegment();
  const subsegment = segment.addNewSubsegment("dispatcher");

  let { headers = null } = request;

  if (!headers) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_HEADERS);
  }

  const {
    authorization = null,
    "x-correlation-id": correlationId = null,
    "x-app-os": appOS = null,
    "x-app-version": appVersion = null,
    "x-app-name": appName = null,
    "x-app-country": appCountry = null,
    "x-device-id": deviceId = null,
    "x-client-id": clientId = null,
    "x-client-secret": clientSecret = null,
  } = headers;

  if (!authorization) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_AUTHORIZATION);
  }

  if (!correlationId) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_CORRELATION_ID);
  }

  subsegment.addAnnotation("CorrelationId", correlationId);

  if (!appOS) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_APP_OS);
  }

  if (
    appOS.toUpperCase().localeCompare(DEFAULT_APP_ANDROID) !== 0 &&
    appOS.toUpperCase().localeCompare(DEFAULT_APP_IOS) !== 0
  ) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.INVALID_APP_OS);
  }

  if (!appVersion) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_APP_VERSION);
  }

  if (!appName) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_APP_NAME);
  }

  if (appName.localeCompare(DEFAULT_APP_CONSUMER) !== 0) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.INVALID_APP_NAME);
  }

  if (!appCountry) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_APP_COUNTRY);
  }

  if (appCountry.localeCompare(DEFAULT_APP_REGION) !== 0) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.INVALID_APP_COUNTRY);
  }

  if (!deviceId) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_DEVICE_ID);
  }

  if (!clientId) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_CLIENT_ID);
  }

  if (!clientSecret) {
    subsegment.close();
    return await ResponseBuilder(HTTP_RESPONSES.NO_CLIENT_SECRET);
  }

  let response = await getCustomer();

  if (response.error) {
    subsegment.close();
    return ResponseBuilder(
      ResponseBuilderExtended(HTTP_RESPONSES.DATABASE_ERROR, response)
    );
  }

  if (!response.Item) {
    subsegment.close();
    return ResponseBuilder(HTTP_RESPONSES.NOT_FOUND);
  }

  subsegment.close();
  return ResponseBuilder(
    ResponseBuilderExtended(HTTP_RESPONSES.REQUEST_SUCCESS, {
      customerData: response.Item,
    })
  );
};

async function getCustomer() {
  const segment = AWSXRayCore.getSegment();
  const subsegment = segment.addNewSubsegment("getCustomer");
  try {
    const params = {
      TableName: DYNAMODB_TABLE_NAME,
      Key: {
        pk: dynamoDbTablePK,
        sk: customers[dynamoDbTableSK],
      },
    };
    const response = await ddbDocClient.send(new GetCommand(params));
    subsegment.close();
    return response;
  } catch (error) {
    console.log(error);
    subsegment.close();
    return { error, message: error["__type"].split("#")[1] };
  }
}
