import { Router } from 'express';
import { exec } from "child_process"

export const roomRoute = Router();

roomRoute.post('/execute', async (req, res) => {
    const { code } = req.body;
    const safeCode = code.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    exec(`node -e "${safeCode}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ output: stderr });
        }
        console.log(stdout);

        res.json({ output: stdout });
    });
});

