import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { createTransaction } from "@/lib/midtrans";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
    req: Request,
    { params }: { params: { storeId: string } }
) {
    const { productIds } = await req.json();

    if (!productIds || productIds.length === 0) {
        return new NextResponse("Product ids are required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
        where: {
            id: {
                in: productIds
            }
        },
        include: {
            category: true
        }
    });

    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId,
            isPaid: false,
            orderItems: {
                create: productIds.map((productId: string) => ({
                    product: {
                        connect: {
                            id: productId
                        }
                    }
                }))
            }
        }
    });

    const item_details: any[] = [];

    products.forEach((product) => {
        item_details.push({
            'id': product.id,
            'price': product.price.toNumber(),
            'quantity': 1,
            'name': product.name,
            'brand': 'WStore',
            'category': product.category.name,
            'merchant_name': 'WStore',
            'url': process.env.FRONTEND_STORE_URL + '/product/' + product.id
        });
    });

    const requestBody = {
        "transaction_details": {
            "order_id": order.id,
            "gross_amount": products.reduce((total, item) => {
                return total + item.price.toNumber()
            }, 0),
        },
        "item_details": item_details
    }


    const res = await createTransaction(requestBody)
    console.log('aawdawdawdawdawdawd', res)
    // .then((transaction) => {
    //     console.log("=======SESSIONNNNN========")
    //     console.log(transaction)
    //     console.log("=======SESSIONNNNN========")
    //     return transaction;
    // }).catch((error) => {
    //     console.log('[BILLBOARD_POST]', error)
    //     return new NextResponse("Internal error", { status: 500 });
    // })

    // const session = await stripe.checkout.sessions.create({
    //     line_items,
    //     mode: 'payment',
    //     billing_address_collection: 'required',
    //     phone_number_collection: {
    //         enabled: true,
    //     },
    //     success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    //     cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    //     metadata: {
    //         orderId: order.id
    //     },
    // });

    return NextResponse.json(res, {
        headers: corsHeaders
    });
};