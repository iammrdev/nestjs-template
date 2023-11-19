import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TestingService } from './testing.service';

@ApiTags('testing')
@Controller('testing')
export class TestingController {
  constructor(private readonly testingService: TestingService) {}

  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All data is deleted',
  })
  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(): Promise<void> {
    await this.testingService.deleteAllData();
  }
}
