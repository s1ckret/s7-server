import { db } from "./db.js";

const TABLE_NAME = "users";

export class User {
    constructor(data) {
        this.id = data.id;
        this.callsign = data.callsign || null;
        this.joined_at = data.joined_at || new Date().toISOString();
        this.admin = data.admin || false;
        this.approved = data.approved || false;
        this.banned = data.banned || false;
        this.total_ammo = data.total_ammo || 0;
        this.total_hit = data.total_hit || 0;
        this.total_drill_time_ms = data.total_drill_time_ms || 0;
    }


    // List users by filter (for admin ban/unban page)
    static async list(filter = {}) {
        try {
            const rows = await db(TABLE_NAME).where(filter).whereNotNull('callsign');
            return rows.map(row => new User(row));
        } catch (error) {
            throw error;
        }
    }

    static async create(userData) {
        const user = new User(userData);
        try {
            await db(TABLE_NAME).insert({ ...user });
            return user;
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                throw new Error(`User with ID ${user.id} already exists.`);
            }
            throw error;
        }
    }

    static async get(userId) {
        try {
            const row = await db(TABLE_NAME).where({ id: userId }).first();
            return row ? new User(row) : null;
        } catch (error) {
            throw error;
        }
    }

    static async update(userId, userData) {
        if (!userData || Object.keys(userData).length === 0) {
            throw new Error("No update parameters provided.");
        }
        try {
            await db(TABLE_NAME).where({ id: userId }).update(userData);
            const updated = await db(TABLE_NAME).where({ id: userId }).first();
            return updated ? new User(updated) : null;
        } catch (error) {
            throw error;
        }
    }

    static async listUnapproved() {
        try {
            const rows = await db(TABLE_NAME)
                .where({ approved: false })
                .whereNotNull('callsign');
            return rows.map(row => new User(row));
        } catch (error) {
            throw error;
        }
    }

    static async delete(userId) {
        try {
            await db(TABLE_NAME).where({ id: userId }).del();
        } catch (error) {
            throw error;
        }
    }
}