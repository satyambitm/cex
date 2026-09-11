import type {Request,Response} from 'express';
import {prisma} from '../db';
import bcrypt from 'bcrypt'
// sign up 
//register new user 
// interface User{
//     username:string,
//     password:string
// }

export const signup=async (req:Request ,res:Response)=>{
    try{
        const {username,password}=req.body;
        // validate 

        if(!username|| !password){
            return res.status(400).json({
                error:"username and pass required"

            })
        }
        // validate pass length 
        if(password.length<6){
            return res.status(400).json({
                error:"password length must be greater than 6 digit "
            });
        }
        // hash password 
        const hashedpassword=await bcrypt.hash(password,10);
        // create user in database 
        const user =await prisma.user.create({
            data:{
                username,
                password:hashedpassword
            }
        });
        // return success
        return res.status(201).json({
            message: "user created successfully"
        })

    }
    catch(error:any){
        return res.status(500).json({
            message:"user already exists or internal server error "
        })

    }

}

// sign in logic

export const signin = async (req:Request,res:Response)=>{
    try{
        const {username,password}=req.body;
        // validate input 
        if(!username||!password){
            return res.status(400).json({
                message:"userid and password are required "
            })
        }

        const user =await prisma.user.findUnique({
            where:{username}
        });
        // check if user exists 
        if(!user){
            return res.status(400).json({
                message:"user not found "
            });
        }
        // verify password 
        const ispasswordvalid=await bcrypt.compare(password,user.password);

        if(!ispasswordvalid){
            return res.status(401).json({
                message:"invalid password"

            })
        }
        // generate jwt 
        const jwt =require('jsonwebtoken');
        const token =jwt.sign(
            {userId:user.id},
            process.env.JWT_SECRET!,
            {expiresIn:'24h'}
        );




        // return success
        return res.status(200).json({
            message:"login successful",
            token:token,
            user:{
                id:user.id,
                username:user.username
            }

        })


    }
    catch(error:any){
        res.status(400).json({
            message:"signin or internal server error"
        })
    }
}




































