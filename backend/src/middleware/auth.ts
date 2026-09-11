import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}



export const authenticateToken=(req:Request,res:Response,next:NextFunction)=>{
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(501).json({error:'access token required'});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET!) as {userId:string};
        req.user=decoded;
        next();



    }catch(error){
        return res.status(403).json({error:"invalid or expired token"})

    }
}