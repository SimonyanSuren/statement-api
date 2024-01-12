import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseMetadata,
  getSchemaPath,
} from '@nestjs/swagger';

type ApiCustomOptions<TModel> = ApiResponseMetadata & {
  model: TModel;
  withPagination?: boolean;
};

export const ApiCustomResponse = <TModel extends Type<any>>(
  options: ApiCustomOptions<TModel>
) =>
  applyDecorators(
    ApiExtraModels(options.model),
    ApiResponse({
      ...options,
      description:
        options.description ||
        `Success response with ${options.model.name.toLowerCase()} data.`,
      schema: {
        properties: {
          success: { type: 'boolean', example: 'true' },
          payload: options.withPagination
            ? {
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(options.model) },
                  },
                  totalCount: { type: 'number' },
                  pageSize: { type: 'number' },
                  currentPage: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              }
            : !options.isArray
              ? { $ref: getSchemaPath(options.model) }
              : {
                  type: 'array',
                  items: { $ref: getSchemaPath(options.model) },
                },
          message: { type: 'string', example: 'message' },
        },
      },
    })
  );
