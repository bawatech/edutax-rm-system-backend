import "reflect-metadata"
import express from 'express'
import { Request,Response } from 'express';
import { User } from "./entites/User";
import { AppDataSource } from "./AppDataSource";
import { createUser } from "./contollers/user.controller";
const app = express();
import userRoutes from './routes/user.rotues'
app.use(express.json());
const port = 3008;




AppDataSource.initialize()
.then(()=>{


    
// app.get('/', async(req,res:Response)=>{
   
//     const userRepo = AppDataSource.getRepository(User)
//     const allRecords = await userRepo.find(); 
//     res.send(allRecords)
//  })

 app.use('/user',userRoutes)
//  app.post('/user',createUser);
 
  
    console.log('db connected')

    app.listen(port,()=>{
        console.log(`App working on ${port}`)
    })

})
.catch((err)=>{
    console.log('db not connected',err)
})
