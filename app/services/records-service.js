import { db } from "./db.js";

const TABLE_NAME = "records";

export class Record {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.drill_id = data.drill_id;
        this.submitted_at = data.submitted_at;
        this.time_ms = data.time_ms;
        this.hit = data.hit;
    }

    /**
     * List all records in a date range, ordered by submitted_at
     * @param {string} startIso - Start date/time (inclusive, 'YYYY-MM-DD HH:mm:ss')
     * @param {string} endIso - End date/time (exclusive, 'YYYY-MM-DD HH:mm:ss')
     * @returns {Promise<Record[]>}
     */
    static async listByDateRange(startIso, endIso) {
        try {
            const rows = await db(TABLE_NAME)
                .whereBetween('submitted_at', [startIso, endIso])
                .orderBy('submitted_at', 'asc');
            return rows.map(row => new Record(row));
        } catch (error) {
            throw error;
        }
    }

    static async create(recordData) {
        const record = new Record(recordData);
        try {
            const [id] = await db(TABLE_NAME).insert({
                user_id: record.user_id,
                drill_id: record.drill_id,
                submitted_at: record.submitted_at,
                time_ms: record.time_ms,
                hit: record.hit
            });
            record.id = id;
            return record;
        } catch (error) {
            throw error;
        }
    }

    static async get(recordId) {
        try {
            const row = await db(TABLE_NAME).where({ id: recordId }).first();
            return row ? new Record(row) : null;
        } catch (error) {
            throw error;
        }
    }

    static async update(recordId, recordData) {
        if (!recordData || Object.keys(recordData).length === 0) {
            throw new Error("No update parameters provided.");
        }
        try {
            await db(TABLE_NAME).where({ id: recordId }).update(recordData);
            const updated = await db(TABLE_NAME).where({ id: recordId }).first();
            return updated ? new Record(updated) : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * List records with pagination
     * @param {Object} options { limit, offset, filter }
     * @returns {Promise<{records: Record[], total: number}>}
     */
    static async list(options = {}) {
        let { limit = 0, offset = 0, filter = {} } = options;
        try {
            let query = db(TABLE_NAME).where(filter).select();
            if (limit > 0) {
                query = query.limit(limit).offset(offset);
            }
            const rows = await query;
            const [{ count }] = await db(TABLE_NAME).where(filter).count({ count: '*' });
            return {
                records: rows.map(row => new Record(row)),
                total: typeof count === 'string' ? parseInt(count) : count
            };
        } catch (error) {
            throw error;
        }
    }

    static async delete(recordId) {
        try {
            await db(TABLE_NAME).where({ id: recordId }).del();
        } catch (error) {
            throw error;
        }
    }
}
