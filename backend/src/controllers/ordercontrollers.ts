import type {Request,Response} from 'express'
import {prisma} from '../db'
import {matchOrder} from '../services/matchingengine'


export const createOrder=async (req:Request,res:Response)=>{

    try{
        const userId=req.user!.userId;
        const{market,side,price,qty,type}=req.body;

        if(!market || !side ||!type||price===undefined||qty===undefined){
            return res.status(400).json({error:"fields are required"})
        }
        if (side !== 'buy' && side !== 'sell') {
            return res.status(400).json({ error: "side must be buy or sell" });
        }
        if(type!== 'limit'){
            return res.status(400).json({message:"only limits are supported for now"})
        }
        if(typeof price!=='number'|| price<=0){
            return res.status(400).json({error:"price must be positive number "})
        }
        if(typeof qty!=='number' ||qty<=0){
            return res.status(400).json({error:"quantity must be positive number"})
        }
        const[base,quote]=market.split('_');

        if(!base || !quote){
            return res.status(400).json({
                error:"market must look like sol usd"
            })
        }
        // buy spend quote currency a sell gives up the base asset 
        const assetToLock=side==='buy'?quote:base;
        const amountToLock=side==='buy'?price*qty:qty;

        const order =await prisma.$transaction(async (tx)=>{
            const balance=await tx.balance.findUnique({
                where:{userId_asset:{userId,asset:assetToLock}}

            });
            if(!balance || balance.available<amountToLock){
                throw new Error('INSUFFICIENT_BALANCE');
            }
            await tx.balance.update({
                where:{userId_asset:{userId,asset:assetToLock}},
                data:{
                    available:{decrement:amountToLock},
                    locked:{increment:amountToLock}
                }
            });
            return tx.order.create({
                data:{userId,market,side,type,price,qty,status:'open'}
            });
        });
        const fills=await matchOrder(order.id);
        const updatedOrder=await prisma.order.findUnique({
            where:{id:order.id}
        })
        return res.status(201).json({message:"order placed",order:updatedOrder,fills})

    }catch(error:any){
        if(error.message==='INSUFFICIENT_BALANCE'){
            return res.status(400).json({error:"insufficient balance"});
        }
        console.error("create order error",error);
        return res.status(500).json({error:"internal server error "})
    }
}

export const cancelOrder=async (req:Request,res:Response)=>{
    try{
        const userId=req.user!.userId;
        const orderId=req.params.orderId as string ;

        const result=await prisma.$transaction(async (tx)=>{
            const order =await tx.order.findUnique({
                where:{id:orderId}
            });
            if(!order){
                throw new Error('ORDER_NOT_FOUND');

            }
            if(order.userId !==userId){
                throw new Error('UNAUTHORISED');
            }
            if(order.status !=='open'){
                throw new Error ('ORDER_NOT_OPEN');

            }
            const [base,quote]=order.market.split('_');
            const assetToUnlock=order.side==='buy'?quote:base;
            const remainingQty=order.qty-order.filledQty;
            const amountToUnlock=order.side==='buy'?order.price*remainingQty :remainingQty;

            await tx.balance.update({
                where:{userId_asset:{userId,asset:assetToUnlock!}},
                data:{
                    locked:{decrement:amountToUnlock},
                    available:{increment:amountToUnlock}

                }
            });
            return tx.order.update({
                where:{id:orderId},
                data:{status:'cancelled'}
            });

        });
        return res.status(200).json({
            message:'order cancelled',
            order:result
        });

    }catch(error:any){
        if(error.message==='ORDER_NOT_FOUND'){
            return res.status(404).json({
                error:'order not found'
            });
        }
        if(error.message=== 'UNAUTHORISED'){
            return res.status(403).json({
                error:'not your order '
            })
        }
        if(error.message==='ORDER_NOT_OPEN'){
            return res.status(400).json({
                error:'order not open'
            })
        }
        console.error('Cancel order error',error);
        return res.status(500).json({
            error:'internal server error '
        })
    }
}
export const getMarketDepth= async(req:Request,res:Response)=>{
    try{
        const market=req.params.market as string;
        const orders=await prisma.order.findMany({
            where:{
                market:market.toUpperCase().replace('-','_'),
                status:'open'
            },
            orderBy:{price:'desc'}
        });
        return res.json({market,orders})

    }catch(error){
        console.error('get market depth error',error);
        return res.status(500).json({error:'internal server error '})

    }
}