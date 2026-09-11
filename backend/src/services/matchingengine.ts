import {prisma} from '../db';
export const matchOrder=async (orderId:string)=>{
    return prisma.$transaction(async (tx)=>{
        const taker =await tx.order.findUnique({
            where:{id: orderId}
        });

        if(!taker || taker.status!=='open') return [];

        const [base,quote]=taker.market.split('_');
        if(!base || !quote){
            throw new Error('Invalid market format');
        }

        const makers=await tx.order.findMany({
            where:{
                market:taker.market,
                side:taker.side==='buy' ?'sell':'buy',
                status:'open',
                userId:{not :taker.userId},
                price:taker.side==='buy' ?{lte:taker.price}:{gte:taker.price}
            },
            orderBy:[
                {price:taker.side==='buy'?'asc':'desc'},
                {createdAt:'asc'}
            ]
        });
        let remaining=taker.qty-taker.filledQty;
        const fills=[];

        for (const maker of makers){
            if(remaining<=0) break;
            const fillQty=Math.min(remaining,maker.qty-maker.filledQty);
            const fillPrice=maker.price;
            const quoteAmount=fillQty*fillPrice;

            const buyer=taker.side==='buy'? taker:maker;
            const seller=taker.side==='buy'? maker:taker;

            // buyer release quote they locked and recieve base 

            await tx.balance.update({
                where:{userId_asset:{userId:buyer.userId!,asset:quote!}},
                data:{
                    locked:{decrement:buyer.price*fillQty},
                    available:{increment:(buyer.price-fillPrice)*fillQty}

                }
            })

            await tx.balance.upsert({
                where:{userId_asset:{userId:buyer.userId!,asset:base!}},
                create:{userId: buyer.userId!,asset:base!,available:fillQty},
                update:{available:{increment:fillQty}}
            });
            // seller will release the base they locked and recieve quote 
            await tx.balance.update({
                where:{userId_asset:{userId:seller.userId!,asset:base!}},
                data:{locked:{decrement:fillQty}}
            });
            await tx.balance.upsert({
                where:{userId_asset:{userId:seller.userId!,asset:quote!}},
                create:{userId:seller.userId!,asset:quote!,available:quoteAmount},
                update:{available:{increment:quoteAmount}}

            });
            const makerFilled=maker.filledQty+fillQty;
            await tx.order.update({
                where:{id:maker.id},
                data:{
                    filledQty:makerFilled,
                    status:makerFilled>=maker.qty? 'filled':'open'
                }
            });
            await tx.fill.createMany({
                data:[
                    {qty:fillQty,price:fillPrice,side:taker.side,type:'taker',
                        userId:taker.userId!,asset:base!,originalOrderId:taker.id
                    },
                    {qty:fillQty,price:fillPrice,side:maker.side,type:'maker',
                        userId:maker.userId!,asset:base!,originalOrderId:maker.id
                    }
                ]
            });
            remaining -=fillQty;
            fills.push({price:fillPrice,qty:fillQty});
        }
        const takerFilled=taker.qty-remaining;
        await tx.order.update({
            where:{id:taker.id},
            data:{
                filledQty:takerFilled,
                status:takerFilled>=taker.qty?'filled':'open'
            }
        });
        return fills;

    })
}