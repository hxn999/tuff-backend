import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CounterDocument = HydratedDocument<Counter>;

@Schema()
export class Counter {
  @Prop({ required: true, unique: true, trim: true })
  id: string;

  @Prop({ type: Number, default: 10001 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);

// Create index for better query performance
CounterSchema.index({ id: 1 });

