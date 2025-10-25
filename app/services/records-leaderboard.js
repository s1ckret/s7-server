import { db } from "./db.js";

const TABLE_NAME = "records";
/**
 * Get leaderboard for a drill, ranked by hits or time
 * @param {string|number} drillId - Drill ID
 * @param {'hits'|'time'} rankBy - Ranking method
 * @returns {Promise<Array<{user_id, hit, time_ms}>>}
 */
export async function getDrillLeaderboard(drillId, rankBy = 'hits') {
    let result;
    if (rankBy === 'hits') {
        result = await db.raw(`
            SELECT
                user_id,
                best_hit,
                best_time_ms
            FROM
                (
                    SELECT
                        r.user_id,
                        r.hit AS best_hit,
                        r.time_ms AS best_time_ms,
                        ROW_NUMBER() OVER (
                            PARTITION BY r.user_id
                            ORDER BY r.hit DESC, r.time_ms ASC
                        ) as rn
                    FROM
                        ?? r
                    WHERE
                        r.drill_id = ?
                ) AS ranked_records
            WHERE
                rn = 1
            ORDER BY
                best_hit DESC,
                best_time_ms ASC
        `, [TABLE_NAME, drillId]);
    } else {
        result = await db.raw(`
            SELECT
                user_id,
                best_hit,
                best_time_ms
            FROM
                (
                    SELECT
                        r.user_id,
                        r.hit AS best_hit,
                        r.time_ms AS best_time_ms,
                        ROW_NUMBER() OVER (
                            PARTITION BY r.user_id
                            ORDER BY r.time_ms ASC, r.hit DESC
                        ) as rn
                    FROM
                        ?? r
                    WHERE
                        r.drill_id = ?
                        AND r.time_ms > 0
                ) AS ranked_records
            WHERE
                rn = 1
            ORDER BY
                best_time_ms ASC,
                best_hit DESC
        `, [TABLE_NAME, drillId]);
    }
    return result;
}
