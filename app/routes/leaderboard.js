import express from "express";
import { User } from "../services/users-service.js";
import { Drill } from "../services/drills-service.js";
import { getDrillLeaderboard } from "../services/records-leaderboard.js";

const router = express.Router();

// GET /leaderboard?drill=ID&rankBy=hits|time
router.get("/leaderboard", async (req, res) => {
    // Get all drills for dropdown
    const { drills } = await Drill.list();
    // Get selected drill
    const selectedDrill = req.query.drill || (drills.length ? drills[0].id : null);
    // Get ranking method
    const rankBy = req.query.rankBy === 'time' ? 'time' : 'hits';
    // Get leaderboard data
    let leaderboard = [];
    if (selectedDrill) {
        leaderboard = await getDrillLeaderboard(selectedDrill, rankBy);
    }
    // Get user info for leaderboard
    const userIds = leaderboard.map(l => l.user_id);
    const users = await Promise.all(userIds.map(id => User.get(id)));
    const userMap = Object.fromEntries(users.filter(u => u).map(u => [u.id, u]));
    // Get drill ammo if needed
    let drillAmmo = null;
    if (selectedDrill) {
        const drill = drills.find(d => String(d.id) === String(selectedDrill));
        drillAmmo = drill?.ammo || null;
    }
    // Enrich leaderboard
    const enriched = leaderboard.map((entry, idx) => ({
        place: idx + 1,
        callsign: userMap[entry.user_id]?.callsign || entry.user_id,
        hit: entry.best_hit,
        time_ms: entry.best_time_ms,
        drill_ammo: drillAmmo
    }));
    res.render("leaderboard", {
        drills,
        selectedDrill,
        rankBy,
        leaderboard: enriched
    });
});

export default router;
