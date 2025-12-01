import { Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    Min,
    IsOptional,
    IsArray,
    IsMongoId,
    IsBoolean,
    IsDate,
    MaxLength,
    Max,
    ValidateIf,
} from 'class-validator';

export class CreateCouponDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;

    @IsEnum(['percentage', 'fixed'])
    @IsNotEmpty()
    discountType: 'percentage' | 'fixed';

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @ValidateIf((o) => o.discountType === 'percentage')
    @Max(100, { message: 'Percentage discount cannot exceed 100%' })
    discountValue: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    minOrderAmount?: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    maxDiscountAmount?: number;

    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    applicableProducts?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    applicableCategories?: string[];

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    usageLimit?: number;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    perUserLimit?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    validFrom: Date;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    validUntil: Date;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    note?: string;
}
