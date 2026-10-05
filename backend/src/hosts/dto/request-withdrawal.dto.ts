import { IsNumber, IsString, IsObject, Min, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestWithdrawalDto {
  @ApiProperty({ description: 'Gross amount to withdraw', example: 500.0 })
  @IsNumber()
  @Min(10, { message: 'Minimum withdrawal amount is £10.00' })
  amount: number;

  @ApiProperty({
    description: 'Payout method (strictly BANK_TRANSFER)',
    example: 'BANK_TRANSFER',
    enum: ['BANK_TRANSFER'],
  })
  @IsIn(['BANK_TRANSFER'], { message: 'Payout method must be BANK_TRANSFER' })
  @IsString()
  @IsNotEmpty()
  payoutMethod: string;

  @ApiProperty({
    description: 'Payout details object',
    example: {
      accountHolderName: 'John Doe',
      bankName: 'Barclays',
      accountNumber: '12345678',
      sortCode: '12-34-56',
    },
  })
  @IsObject()
  payoutDetails: Record<string, any>;
}
