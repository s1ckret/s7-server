import express from "express";
import { Drill } from "../services/drills-service.js";

const router = express.Router();


// GET /drills - list all drills
router.get("/drills", async (req, res) => {
    try {
        const drills = await Drill.list();
        let success;
        if (req.session && req.session.success) {
            success = req.session.success;
            delete req.session.success;
        }
        res.render("drills", { drills, success });
    } catch (error) {
        res.status(500).send("Failed to load drills");
    }
});

// GET /drills/create - show create form (admin only)
router.get("/drills/create", (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(403).send("Forbidden");
    }
    res.render("drills-create");
});

// POST /drills/create - handle form submit (admin only)
router.post("/drills/create", async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(403).send("Forbidden");
    }
    const { name, description, ammo } = req.body;
    try {
        await Drill.create({ name, description, ammo: parseFloat(ammo) });
        if (req.session) {
            req.session.success = 'Drill created successfully.';
        }
        res.redirect("/drills");
    } catch (error) {
        res.render("drills-create", { error: error.message });
    }
});

export default router;
