import mongoose from 'mongoose'

const connectDB = async (): Promise<void> => {
    const uri = process.env.MONGODB_URI || ''

    if (!uri) {
        throw new Error('MONGODB_URI is not defined in .env')
    }

    await mongoose.connect(uri)
    console.log('MongoDB connected')

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected')
    })

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB error:', err)
    })
}

export default connectDB