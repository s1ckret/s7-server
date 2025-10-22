import { db } from "./db.js";

const TABLE_NAME = "drills";

export class Drill {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description || null;
        this.ammo = data.ammo;
    }

    static async create(drillData) {
        const drill = new Drill(drillData);
        try {
            const [id] = await db(TABLE_NAME).insert({
                name: drill.name,
                description: drill.description,
                ammo: drill.ammo
            });
            drill.id = id;
            return drill;
        } catch (error) {
            throw error;
        }
    }

    static async get(drillId) {
        try {
            const row = await db(TABLE_NAME).where({ id: drillId }).first();
            return row ? new Drill(row) : null;
        } catch (error) {
            throw error;
        }
    }

    static async update(drillId, drillData) {
        if (!drillData || Object.keys(drillData).length === 0) {
            throw new Error("No update parameters provided.");
        }
        try {
            await db(TABLE_NAME).where({ id: drillId }).update(drillData);
            const updated = await db(TABLE_NAME).where({ id: drillId }).first();
            return updated ? new Drill(updated) : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * List drills with pagination
     * @param {Object} options { limit, offset }
     * @returns {Promise<{drills: Drill[], total: number}>}
     */
    static async list(options = {}) {
        let { limit = 0, offset = 0 } = options;
        try {
            let query = db(TABLE_NAME).select();
            if (limit > 0) {
                query = query.limit(limit).offset(offset);
            }
            const rows = await query;
            const [{ count }] = await db(TABLE_NAME).count({ count: '*' });
            return {
                drills: rows.map(row => new Drill(row)),
                total: typeof count === 'string' ? parseInt(count) : count
            };
        } catch (error) {
            throw error;
        }
    }

    static async delete(drillId) {
        try {
            await db(TABLE_NAME).where({ id: drillId }).del();
        } catch (error) {
            throw error;
        }
    }
}
