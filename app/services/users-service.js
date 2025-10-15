// User model for DynamoDB users table
import { ddbDocumentClient } from "./dynamo.js";
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME;

export class User {
    constructor(data) {
        this.id = data.id;
        this.callsign = data.callsign || null;
        this.joined_at = data.joined_at || new Date().toISOString();
        this.admin = data.admin || false;
        this.approved = data.approved || false;
        this.total_ammo = data.total_ammo || 0;
        this.total_hit = data.total_hit || 0;
        this.total_drill_time_ms = data.total_drill_time_ms || 0;
    }

    static async create(userData) {
        const user = new User(userData);
        const params = {
            TableName: TABLE_NAME,
            Item: { ...user },
            ConditionExpression: "attribute_not_exists(id)",
        };
        try {
            await ddbDocumentClient.send(new PutCommand(params));
            return user;
        } catch (error) {
            if (error.name === "ConditionalCheckFailedException") {
                throw new Error(`User with ID ${user.id} already exists.`);
            }
            throw error;
        }
    }

    static async get(userId) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id: userId },
        };
        try {
            const { Item } = await ddbDocumentClient.send(new GetCommand(params));
            return Item ? new User(Item) : null;
        } catch (error) {
            throw error;
        }
    }

    static async update(userId, userData) {
        const updateExpressions = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};
        let valueCounter = 0;
        for (const [key, value] of Object.entries(userData)) {
            if (value !== undefined) {
                const nameKey = `#n${valueCounter}`;
                const valueKey = `:v${valueCounter}`;
                updateExpressions.push(`${nameKey} = ${valueKey}`);
                expressionAttributeNames[nameKey] = key;
                expressionAttributeValues[valueKey] = value;
                valueCounter++;
            }
        }
        if (updateExpressions.length === 0) {
            throw new Error("No update parameters provided.");
        }
        const params = {
            TableName: TABLE_NAME,
            Key: { id: userId },
            UpdateExpression: "SET " + updateExpressions.join(", "),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
        };
        try {
            const { Attributes } = await ddbDocumentClient.send(new UpdateCommand(params));
            return new User(Attributes);
        } catch (error) {
            throw error;
        }
    }

    static async delete(userId) {
        const params = {
            TableName: TABLE_NAME,
            Key: { id: userId },
            ConditionExpression: "attribute_exists(id)",
        };
        try {
            await ddbDocumentClient.send(new DeleteCommand(params));
        } catch (error) {
            if (error.name === "ConditionalCheckFailedException") {
                return; // Already deleted or not found
            }
            throw error;
        }
    }
}