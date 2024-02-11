import "reflect-metadata"
import express from 'express'
import { Request,Response } from 'express';
import { User } from "./entites/User";
import { AppDataSource } from "./AppDataSource";
import { createUser } from "./contollers/user.controller";
const app = express();
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import executiveRoutes from './routes/executive.routes'
app.use(express.json());
const port = 3011




AppDataSource.initialize()
.then(()=>{


    
// app.get('/', async(req,res:Response)=>{
   
//     const userRepo = AppDataSource.getRepository(User)
//     const allRecords = await userRepo.find(); 
//     res.send(allRecords)
//  })

 app.use('/user',userRoutes)
 app.use('/auth',authRoutes)
 app.use('/executive',executiveRoutes)
//  app.post('/user',createUser);
 
  
    console.log('db connected')

    app.listen(port,()=>{
        console.log(`App working on ${port}`)
    })

})
.catch(()=>{
    console.log('db not connected')
})
