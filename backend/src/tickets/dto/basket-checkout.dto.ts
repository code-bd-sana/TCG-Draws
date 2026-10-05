import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class BasketCheckoutItemDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    description: 'The unique ID of the raffle/competition',
  })
  @IsString()
  @IsNotEmpty()
  raffleId: string;

  @ApiProperty({
    example: 3,
    description: 'Number of tickets requested for this competition',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ShippingDetailsDto {
  @ApiProperty({ example: 'John', description: 'Buyer first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Buyer last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Buyer contact email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+44 7700 900123', description: 'Buyer contact phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '1995-06-15', description: 'Buyer date of birth (YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: '12 Fairway Lane', description: 'Street address line 1' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apt 4B', description: 'Apartment, suite, unit (optional)' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'London', description: 'Town or City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SW1A 1AA', description: 'UK Postal Code' })
  @IsString()
  @IsNotEmpty()
  postcode: string;

  @ApiPropertyOptional({ example: 'United Kingdom', description: 'Country of delivery', default: 'United Kingdom' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether to update buyer profile with this shipping address' })
  @IsOptional()
  @IsBoolean()
  saveToProfile?: boolean;
}

export class BasketCheckoutDto {
  @ApiProperty({
    type: [BasketCheckoutItemDto],
    description: 'List of competitions and ticket quantities to purchase',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BasketCheckoutItemDto)
  items: BasketCheckoutItemDto[];

  @ApiProperty({
    type: ShippingDetailsDto,
    description: 'Contact and shipping address details for the entrant',
  })
  @ValidateNested()
  @Type(() => ShippingDetailsDto)
  shippingDetails: ShippingDetailsDto;
}
