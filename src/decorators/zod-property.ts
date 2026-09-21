import 'reflect-metadata';

import { z } from 'zod';

export const ZOD_SCHEMA_PROPERTY = Symbol('zod:schema:property');

// Decorator options
export interface ZodPropertyOptions {
  schema: z.ZodType | (() => z.ZodType);

  /**
   * Make property optional when generating schema for certain variants
   */
  optionalForVariants?: string[];

  /**
   * Skip property when generating schema for certain variants (blacklist)
   */
  skipForVariants?: string[];

  /**
   * Include property only when generating schema for specified variants (whitelist)
   */
  includeForVariants?: string[];

  /**
   * Transform property for certain variants
   */
  transformForVariants?: Record<string, (schema: z.ZodType) => z.ZodType>;
}

// Metadata storage
export interface ZodPropertyMetadata {
  propertyKey: string | symbol;
  schema: z.ZodType | (() => z.ZodType);
  optionalForVariants: string[];
  skipForVariants: string[];
  includeForVariants: string[];
  transformForVariants: Record<string, (schema: z.ZodType) => z.ZodType>;
}

export function ZodProperty(options: ZodPropertyOptions | z.ZodType | (() => z.ZodType)): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const ctor = target.constructor;

    let existingMetadata: ZodPropertyMetadata[] = Reflect.getOwnMetadata(ZOD_SCHEMA_PROPERTY, ctor) ?? [];

    // First time copy metadata from base class if anything exists
    if (!existingMetadata || existingMetadata.length < 1) {
      existingMetadata = [...(Reflect.getMetadata(ZOD_SCHEMA_PROPERTY, ctor) ?? [])];
    }

    // Prevent duplicate metadata registration
    const index = existingMetadata.findIndex((m) => m.propertyKey === propertyKey);

    // Prepare new record
    const metadata: ZodPropertyMetadata = {
      propertyKey: propertyKey,
      ...(options instanceof z.ZodType || typeof options === 'function'
        ? {
            // Only ZodType is provided, on additional properties
            schema: options,
            optionalForVariants: [],
            skipForVariants: [],
            includeForVariants: [],
            transformForVariants: {},
          }
        : {
            // ZodType is provided with additional properties
            schema: options.schema,
            optionalForVariants: options.optionalForVariants ?? [],
            skipForVariants: options.skipForVariants ?? [],
            includeForVariants: options.includeForVariants ?? [],
            transformForVariants: options.transformForVariants ?? {},
          }),
    };

    if (index === -1) {
      // No existing metadata found => add new record
      existingMetadata.push(metadata);
    } else {
      // Found existing metadata => overwrite
      existingMetadata[index] = metadata;
    }

    // Set updated metadata
    Reflect.defineMetadata(ZOD_SCHEMA_PROPERTY, existingMetadata, ctor);
  };
}
