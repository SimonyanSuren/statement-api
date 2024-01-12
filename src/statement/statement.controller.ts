import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiDefaultResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import LocalFilesInterceptor from '../common/Interceptors/localFiles.interceptor';
import { ApiCustomResponse } from '../common/decorators';
import { IErrorResponse } from '../common/filters/errorResponse.interface';
import { GenericResponse } from '../common/interfaces/response.interface';
import { CustomerStatementEntity } from './entities/customerStatement.entity';
import { FailedStatementEntity } from './entities/failedStatement.entity';
import { StatementService } from './statement.service';

@ApiTags('Statements')
@Controller('statements')
@ApiDefaultResponse({
  type: IErrorResponse,
  description: 'Default error response.',
})
export class StatementController {
  constructor(private readonly statementService: StatementService) {}

  @Post('file')
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'file',
    })
  )
  @ApiOperation({
    description: 'Upload customer statement document.',
    summary: 'Upload customer statement document.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    type: GenericResponse,
    description: 'success response with message',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'file',
          format: 'binary',
        },
      },
    },
  })
  public async uploadImageForUser(
    @UploadedFile(ParseFilePipe) file: Express.Multer.File
  ): Promise<GenericResponse<null>> {
    await this.statementService.operateStatementFile(file);
    return {
      success: true,
      payload: null,
      message: 'File uploaded successfully.',
    };
  }

  @Get()
  @ApiOperation({
    description: 'Get customer statements',
    summary: 'Get customer statements',
  })
  @ApiCustomResponse({
    status: HttpStatus.OK,
    model: CustomerStatementEntity,
    isArray: true,
  })
  @ApiQuery({
    name: 'id',
    type: 'number',
    required: false,
  })
  public async getCustomerStatements(
    @Query('id') statementId?: number
  ): Promise<GenericResponse<CustomerStatementEntity[]>> {
    const statements = await this.statementService.getStatements(statementId);

    return {
      success: true,
      payload: statements,
    };
  }

  @Get(':id')
  @ApiOperation({
    description: 'Get customer statement by id',
    summary: 'Get customer statement by id',
  })
  @ApiCustomResponse({
    status: HttpStatus.OK,
    model: CustomerStatementEntity,
    isArray: false,
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    required: true,
  })
  public async getCustomerStatementById(
    @Param('id', ParseIntPipe) statementId: number
  ): Promise<GenericResponse<CustomerStatementEntity[]>> {
    const statement = await this.statementService.getStatements(statementId);

    if (statement)
      throw new NotFoundException(`Customer statement with ${statementId} not found.`);

    return {
      success: true,
      payload: statement,
    };
  }

  @Get('failed/report')
  @ApiOperation({
    description: 'Get failed statements report.',
    summary: 'Get failed statements report.',
  })
  @ApiCustomResponse({
    status: HttpStatus.OK,
    model: FailedStatementEntity,
    isArray: true,
  })
  @ApiQuery({
    name: 'id',
    type: 'number',
    required: false,
  })
  public async getFailedStatements(
    @Query('id') statementId?: number
  ): Promise<GenericResponse<FailedStatementEntity[]>> {
    const failedStatement = await this.statementService.getFailedStatements(statementId);

    return {
      success: true,
      payload: failedStatement,
    };
  }
}
