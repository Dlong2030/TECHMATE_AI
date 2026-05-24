import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import connectDB from './config/db'
import dotenv from 'dotenv'
import characterRoutes from './routes/characterRoutes'

// import chatRoutes from './routes/chat'
// import sessionRoutes from './routes/sessions'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGODB_URI || ''

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
    credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/v1/characters', characterRoutes)
// app.use('/api/chat', chatRoutes)
// app.use('/api/sessions', sessionRoutes)

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    })
})

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Error]', err.message)
    res.status(500).json({ error: err.message || 'Internal server error' })
})

// ─── Database + Start Server ─────────────────────────────────────────────────

const start = async (): Promise<void> => {
    try {
        await connectDB()

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

start()

export default app