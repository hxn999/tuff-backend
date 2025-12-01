import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiatePaymentDto';

@Controller('payments')
export class PaymentsController {
    constructor(private paymentService: PaymentsService) {}

    @Post('init')
    async initialize(@Body() initiatePayment:InitiatePaymentDto)
    {
       return this.paymentService.initiatePayment(initiatePayment)
    }


    @Post('success-validation')
    async paymentValidation(@Body() body:any)
    {
        
        console.log("received success notification")
        console.log(body)
    }


    @Post('failed')
    async failedPayment()
    {
        console.log("received fail notification")
    }

    @Post('canceled')
    async canceledPayment()
    {
        console.log("received cancel notification")
    }


}
