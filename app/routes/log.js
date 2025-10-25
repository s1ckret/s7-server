import express from "express";
import { Record } from "../services/records-service.js";
import { User } from "../services/users-service.js";
import { Drill } from "../services/drills-service.js";

const router = express.Router();


router.get("/log", async (req, res) => {
    // Get date from query or default to today
    let selectedDate = req.query.date;
    let dateObj;
    if (selectedDate) {
        // Expect format YYYY-MM-DD
        dateObj = new Date(selectedDate);
    } else {
        dateObj = new Date();
        selectedDate = dateObj.toISOString().slice(0, 10);
    }
    // Start and end of selected day
    const startOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const endOfDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1);
    const startIso = startOfDay.toISOString();
    const endIso = endOfDay.toISOString();

    // Fetch all records for the selected day
    const records = await Record.listByDateRange(startIso, endIso);

    // Get all user IDs and drill IDs
    const userIds = [...new Set(records.map(r => r.user_id))];
    const drillIds = [...new Set(records.map(r => r.drill_id))];

    // Fetch users and drills
    const users = await Promise.all(userIds.map(id => User.get(id)));
    const drills = await Promise.all(drillIds.map(id => Drill.get(id)));

    // Map for quick lookup
    const userMap = Object.fromEntries(users.filter(u => u).map(u => [u.id, u]));
    const drillMap = Object.fromEntries(drills.filter(d => d).map(d => [d.id, d]));

    // Get and clear success message from session
    let success;
    if (req.session && req.session.success) {
        success = req.session.success;
        delete req.session.success;
    }

    // Enrich records with user-friendly submitted_at
    const enriched = records.map(r => ({
        id: r.id,
        submitted_at: r.submitted_at ? new Date(r.submitted_at).toLocaleString('uk-UA', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }) : '',
        hit: r.hit,
        time_ms: r.time_ms,
        user_id: r.user_id,
        callsign: userMap[r.user_id]?.callsign || '',
        drill_id: r.drill_id,
        drill_name: drillMap[r.drill_id]?.name || '',
        drill_ammo: drillMap[r.drill_id]?.ammo || '',
    }));

    res.render("log", { records: enriched, selectedDate, success });
});

// Delete a record (admin only)
router.post("/log/:id", async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(403).send("Forbidden");
    }
    try {
        await Record.delete(req.params.id);
        if (req.session) {
            req.session.success = "Запис видалено.";
        }
        // Redirect back to the same date
        const redirectDate = req.body.date || req.query.date || '';
        res.redirect(`/log${redirectDate ? `?date=${redirectDate}` : ''}`);
    } catch (error) {
        res.status(500).send("Error deleting record");
    }
});

export default router;
