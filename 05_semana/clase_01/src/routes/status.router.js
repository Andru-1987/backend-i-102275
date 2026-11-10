import { Router } from "express";

const router = new Router()


router.get("/health", (_, response) => response.status(200).json({ status: 'ok', serverName: 'AndruServer' }))
router.get("/info", (_, response) => response.status(200).json({ status: 'ok', version: process.versions.node }))

export default router