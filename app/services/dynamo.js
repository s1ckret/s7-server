import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const ddbDocumentClient = DynamoDBDocumentClient.from(ddbClient);

export { ddbClient, ddbDocumentClient };