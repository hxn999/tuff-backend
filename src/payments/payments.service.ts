import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './schemas/payment.schema';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { InitiatePaymentDto } from './dto/initiatePaymentDto';
import { log } from 'console';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private configService: ConfigService,
  ) {}

  async initiatePayment(initData: InitiatePaymentDto):Promise<any> {
    const trxid = new Types.ObjectId().toHexString();
    // saving to db first
    let initiatedPayment = new this.paymentModel({
      ...initData,
      tran_id: trxid,
    });
    let savedPayment = await initiatedPayment.save();
	console.log("db saved")
    const params = {
      store_id: this.configService.get<string>('STORE_ID'),
      store_passwd: this.configService.get<string>('STORE_PASSWD'),
      ...initData,
      total_amount: initData.total_amount.toString(),
      tran_id: trxid,
	  success_url: 'http://localhost:3005/payments/success-validation',
	  fail_url: 'http://localhost:3005/payments/failed',
	  cancel_url: 'http://localhost:3005/payments/canceled',
    };
    const query = new URLSearchParams(params as Record<string, string>);
    const baseUrl = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
	console.log("making ssl request");
	
    // initiate payment in sslcommerze 
    const res = await fetch(baseUrl, {
		body:query.toString(),
		method:"POST",
		
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

	
	console.log(res)
	const data = await res.json();
	console.log(data)
	return data; 
  }
}
