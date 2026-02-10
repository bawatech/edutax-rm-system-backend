import "reflect-metadata"
import express from 'express'
import { AppDataSource } from "./AppDataSource";
const app = express();
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import executiveRoutes from './routes/executive.routes'
import externalWebhookRoutes from './routes/external.routes'
import cors from 'cors'
import path from 'path';
const allowedOrigins = process.env?.ALLOWED_ORIGINS?.split(',') || '';

// Apply CORS to all routes EXCEPT the webhook endpoints
app.use((req, res, next) => {
    if (req.path !== '/external/stripe-webhook') {
        cors({
            origin: (origin, callback) => {
                if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
        })(req, res, next); // Call the cors middleware if not a webhook.
    } else {
        next(); // Skip CORS for webhook endpoints
    }
});

app.use('/external/webhook', express.raw({ type: 'application/json' }), externalWebhookRoutes);
app.use(express.json());

 
const port = process.env.APP_PORT;
AppDataSource.initialize()
    .then(() => {

        app.use('/storage/documents', express.static(path.join(__dirname, '..', 'storage', 'documents'))); // for uploads

        app.use('/user', userRoutes)
        app.use('/auth', authRoutes)
        app.use('/executive',executiveRoutes)
        app.listen(port, () => {
            console.log(`App working on ${port}`)
        }) 

    })
    .catch((err) => {
        console.log('db not connected',err)
    })
