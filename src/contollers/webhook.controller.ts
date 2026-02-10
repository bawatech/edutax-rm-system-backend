import { Request, Response } from 'express';
import { handleCatch} from '../utils/responseHanlder';
import Stripe from 'stripe';
import { AppDataSource } from '../AppDataSource';
import { PaymentOrder } from '../entites/PaymentOrders';



export const webhookStripe = async (req: Request, res: Response) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const webhookSecretKey = process.env.STRIPE_WEBHOOK_SIGNING_SECRET || '';
    const sig = req.headers['stripe-signature'];
    let event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecretKey);
    // console.log('STRIPE EVENT RECEIVED:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
          // console.log("Payment Success")
          await updatePaymentOrderStatus(event);
          break;
      case 'payment_intent.payment_failed':
          // console.log("Payment Failed")
          break;

      default:
      console.log(`Unhandled event type ${event.type}`);
  }
    res.status(200).json({ message: 'Webhook received successfully' });
  } catch (e) {
    console.error('STRIPE WEBHOOK ERROR:', e);
    return handleCatch(res, e);
  }
};


const updatePaymentOrderStatus = async (event: any) => {
  // console.log('PAYMENT INTENT DATA',event?.data)
  // console.log('PAYMENT INTENT DATA OBJE',event?.data?.object)
  try {
      const paymentIntent = event.data.object;
      const payment_intent_id = paymentIntent.payment_intent;
      const orderId = paymentIntent.metadata.orderId;
      const sessionId = paymentIntent.id;
      let payment_status = paymentIntent.payment_status;
      if (payment_status === "paid") {
          payment_status = "Paid";
      } else {
          payment_status = "Asked";
      }
      const repoPaymentOrder = AppDataSource.getRepository(PaymentOrder);

      const order = await repoPaymentOrder.findOne({where:{session_id:sessionId,id:orderId,payment_status:'Pending'}});

      if(order){
        order.payment_status = payment_status;
        order.payment_intent_id = payment_intent_id
        order.payment_status_updated_on = new Date()
        await repoPaymentOrder.save(order)
      }
      return true;
  } catch (e) {
      throw e;
  }
}