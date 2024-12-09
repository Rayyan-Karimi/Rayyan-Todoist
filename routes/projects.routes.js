import express from 'express'
import * as projects from "../controllers/projects.controller.js"
const ProjectRoutes = (server) => {
    const router = express.Router()
    router.post("/", projects.createProject)
    router.get("/", projects.read)
    router.get("/:id", projects.read)
    router.put("/:id", projects.updateProject)
    router.delete("/:id", projects.deleteProject)
    router.delete("/", projects.deleteProject)
    server.use("/api/projects", router)
}
export default ProjectRoutes;