import express from "express";
import { Drill } from "../services/drills-service.js";

const router = express.Router();


// GET /drills - list all drills
// GET /drills - list all drills with pagination
router.get("/drills", async (req, res) => {
    // Parse pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(20, parseInt(req.query.limit) || 5));
    const offset = (page - 1) * limit;
    try {
        const { drills, total } = await Drill.list({ limit, offset });
        let success;
        if (req.session && req.session.success) {
            success = req.session.success;
            delete req.session.success;
        }
        const totalPages = Math.ceil(total / limit);
        res.render("drills", {
            drills,
            success,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasPrev: page > 1,
                hasNext: page < totalPages
            }
        });
    } catch (error) {
        res.status(500).send("Помилка завантаження вправ.");
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
            req.session.success = 'Вправу додано.';
        }
        res.redirect("/drills");
    } catch (error) {
        res.render("drills-create", { error: error.message });
    }
});

// GET /drills/:id/edit - show edit form (admin only)
router.get("/drills/:id/edit", async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(403).send("Forbidden");
    }
    try {
        const drill = await Drill.get(req.params.id);
        if (!drill) return res.status(404).send("Вправу не знайдено.");
        res.render("drills-edit", { drill });
    } catch (error) {
        res.status(500).send("Помилка.");
    }
});

// PUT /drills/:id - update drill (admin only)
router.put("/drills/:id", async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(403).send("Forbidden");
    }
    const { name, description, ammo } = req.body;
    try {
        await Drill.update(req.params.id, {
            name,
            description,
            ammo: parseInt(ammo)
        });
        if (req.session) {
            req.session.success = 'Вправу оновлено.';
        }
        res.redirect("/drills");
    } catch (error) {
        // reload form with error
        const drill = await Drill.get(req.params.id);
        res.render("drills-edit", { drill, error: error.message });
    }
});

// DELETE /drills/:id - delete drill (admin only)
router.delete("/drills/:id", async (req, res) => {
    if (!req.user || !req.user.admin) {
        return res.status(403).send("Forbidden");
    }
    try {
        await Drill.delete(req.params.id);
        if (req.session) {
            req.session.success = 'Вправу видалено.';
        }
        res.redirect("/drills");
    } catch (error) {
        if (req.session) {
            req.session.success = 'Помилка видалення.';
        }
        res.redirect("/drills");
    }
});

export default router;
