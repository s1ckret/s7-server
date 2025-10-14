// user-crud.js
import { ddbDocumentClient } from "./dynamo.js";
import { GetCommand, PutCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";


const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE_NAME
/**
 * C - Create a new user item.
 * @param {object} userData - The user data object.
 * @returns {Promise<object>} - The created user data.
 */
export async function createUser(userData) {
    const params = {
        TableName: TABLE_NAME,
        Item: {
            // PK: id
            id: userData.id,
            callsign: userData.callsign || null,
            joined_at: new Date().toISOString(),
            admin: userData.admin || false,
            approved: userData.approved || false,
            total_ammo: userData.total_ammo || 0,
            total_hit: userData.total_hit || 0,
            total_drill_time_ms: userData.total_drill_time_ms || 0,
        },
        ConditionExpression: "attribute_not_exists(id)", // Ensure the ID doesn't already exist
    };

    try {
        await ddbDocumentClient.send(new PutCommand(params));
        console.log("User created successfully:", userData.id);
        return params.Item;
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            throw new Error(`User with ID ${userData.id} already exists.`);
        }
        console.error("Error creating user:", error);
        throw error;
    }
}

/**
 * R - Read a user item by its ID (PK).
 * @param {string} userId - The Google ID of the user.
 * @returns {Promise<object|null>} - The user item, or null if not found.
 */
export async function readUser(userId) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id: userId,
        },
    };

    try {
        const { Item } = await ddbDocumentClient.send(new GetCommand(params));

        // Item will be undefined if no user is found
        return Item || null;
    } catch (error) {
        console.error("Error reading user:", error);
        throw error;
    }
}

/**
 * U - Update a user's callsign and update the total_ammo.
 * @param {string} userId - The Google ID of the user.
 * @param {string} [callsign] - New callsign (optional).
 * @param {number} [ammoChange] - Amount to add to total_ammo (e.g., 100).
 * @returns {Promise<object>} - The updated attributes (e.g., callsign, total_ammo).
 */
export async function updateUser(userId, userData) {
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    const {
        callsign,
        joined_at,
        admin,
        approved,
        total_ammo,
        total_hit,
        total_drill_time_ms
    } = userData;

    let valueCounter = 0;

    // Helper function to check and add an attribute to the update list
    const addUpdateAttribute = (key, value) => {
        if (value !== undefined) {
            const nameKey = `#n${valueCounter}`;
            const valueKey = `:v${valueCounter}`;

            // For SET operations
            updateExpressions.push(`${nameKey} = ${valueKey}`);

            // Attribute Names (if key conflicts with DynamoDB reserved words)
            expressionAttributeNames[nameKey] = key;

            // Attribute Values
            expressionAttributeValues[valueKey] = value;

            valueCounter++;
        }
    };

    // --- Conditional Updates ---
    addUpdateAttribute('callsign', callsign);
    addUpdateAttribute('joined_at', joined_at);
    addUpdateAttribute('admin', admin);
    addUpdateAttribute('approved', approved);
    addUpdateAttribute('total_ammo', total_ammo);
    addUpdateAttribute('total_hit', total_hit);
    addUpdateAttribute('total_drill_time_ms', total_drill_time_ms);
    // ---------------------------

    if (updateExpressions.length === 0) {
        throw new Error("No update parameters provided.");
    }

    const params = {
        TableName: TABLE_NAME,
        Key: { id: userId },
        UpdateExpression: "SET " + updateExpressions.join(", "),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
    };

    try {
        const { Attributes } = await ddbDocumentClient.send(new UpdateCommand(params));
        console.log("User updated successfully:", userId);
        return Attributes;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
}

/**
 * D - Delete a user item by its ID (PK).
 * @param {string} userId - The Google ID of the user.
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            id: userId,
        },
        // Optional: Ensure the item exists before deleting it
        ConditionExpression: "attribute_exists(id)",
    };

    try {
        await ddbDocumentClient.send(new DeleteCommand(params));
        console.log("User deleted successfully:", userId);
    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            // Handle case where item didn't exist, though DeleteCommand succeeds anyway unless ConditionExpression is used
            console.log(`User with ID ${userId} not found or already deleted.`);
            return;
        }
        console.error("Error deleting user:", error);
        throw error;
    }
}