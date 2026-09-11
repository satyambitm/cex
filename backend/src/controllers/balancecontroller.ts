import type{Request,Response} from 'express'
import {prisma} from '../db'

export const getBalances= async(req:Request,res:Response)=>{
    try{
        const userId=req.user!.userId;

        const balances=await prisma.balance.findMany({
            where:{userId}
        })
        return res.status(200).json({balances})

    }catch(error){
        console.error("get balance error",error);
        return res.status(500).json({message:'internal server error'})

    }
}

export const deposit = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { asset, amount } = req.body;
        if (!asset || amount === undefined) {
            return res.status(400).json({ error: "asset and amount are required" });
        }
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: "amount must be a positive number" });
        }
        const balance=await prisma.balance.upsert({
            where:{userId_asset:{userId,asset}},
            create:{userId,asset,available:amount},
            update:{available:{increment:amount}}
        });
        return res.status(200).json({message:"deposit successful",balance})
    }catch(error){
        return res.status(403).json({succes:false,message:"deposit unsuccessful "})

    }
}



























































