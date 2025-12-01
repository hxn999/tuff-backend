// parse-form-data-json.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFormDataJsonPipe implements PipeTransform {
  transform(value: any) {

    console.log("validating...")
    const jsonFields = ['tags', 'category', 'options'];
    
    jsonFields.forEach(field => {
      if (value[field] && typeof value[field] === 'string') {
        try {
          value[field] = JSON.parse(value[field]);
        } catch (e) {
          throw new BadRequestException(`Invalid JSON in field: ${field}`);
        }
      }
    });

    // Convert string numbers to actual numbers
    if (value.price) value.price = Number(value.price);
    if (value.stock) value.stock = Number(value.stock);
    if (value.lastingTime) value.lastingTime = Number(value.lastingTime);
    if (value.top_image) value.top_image = Number(value.top_image);

    return value;
  }
}