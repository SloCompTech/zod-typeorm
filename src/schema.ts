import 'reflect-metadata';

import { z } from 'zod';

import { ZOD_SCHEMA_PROPERTY, type ZodPropertyMetadata } from './decorators/zod-property.js';

export interface CreateZodSchemaOptions {
  /**
   * Create strict schema
   */
  strict?: boolean;

  /**
   * Make fields optional
   */
  optionalFields?: (string | symbol)[];

  /**
   * Skip additional fields
   */
  skipFields?: (string | symbol)[];

  /**
   * Add additional field transformation
   */
  transformFields?: Record<string | symbol, (schema: z.ZodType) => z.ZodType>;

  /**
   * Additional schema transformation
   */
  transformSchema?: (schema: z.ZodObject<z.ZodRawShape>) => z.ZodObject<z.ZodRawShape>;

  /**
   * Add additional schema transformation for certain schemas
   */
  transformSchemaForVariants?: Record<string, (schema: z.ZodObject<z.ZodRawShape>) => z.ZodObject<z.ZodRawShape>>;
}

/**
 * Generate schema from decorated class for variant
 * @param entityClass Entity class
 * @param variantName Variant name
 * @param options Options
 * @returns z.ZodObject
 */
export function createZodSchemaFromEntity<T>(
  entityClass: new () => T,
  variantName: string = 'default',
  options: CreateZodSchemaOptions = {},
): z.ZodObject<z.ZodRawShape> {
  // Get metadata for properties
  const propertyMetadata: ZodPropertyMetadata[] = Reflect.getMetadata(ZOD_SCHEMA_PROPERTY, entityClass) ?? [];
  if (propertyMetadata.length <= 0)
    throw new Error(`No Zod metadata found on Entity ${entityClass.name} (Use @ZodProperty)`);

  // Build set of properties for zod schema
  const shape: Record<string, z.ZodType> = {};

  for (const item of propertyMetadata) {
    if (!item.propertyKey) continue;

    // Go over each property decorator metadata
    // Check if field needs to be skipped (schema skip, skip field because of variant) or if not in include list
    if (
      options.skipFields?.includes(item.propertyKey) ||
      item.skipForVariants.includes(variantName) ||
      (item.includeForVariants.length > 0 && !item.includeForVariants.includes(variantName))
    )
      continue;

    const propertyKey = String(item.propertyKey);
    shape[propertyKey] = typeof item.schema === 'function' ? item.schema() : item.schema;
    if (variantName in item.transformForVariants && item.transformForVariants[variantName])
      shape[propertyKey] = item.transformForVariants[variantName](shape[propertyKey]);
    if (item.propertyKey && options.transformFields && item.propertyKey in options.transformFields) {
      const transformFn = options.transformFields[item.propertyKey];
      if (transformFn)
        // Transform field
        shape[propertyKey] = transformFn(shape[propertyKey]);
    }
    if (options.optionalFields?.includes(item.propertyKey) || item.optionalForVariants.includes(variantName))
      // Make field optional
      shape[propertyKey] = shape[propertyKey].optional();
  }

  let schema: z.ZodObject<z.ZodRawShape> = z.object(shape);
  if (
    options.transformSchemaForVariants &&
    variantName in options.transformSchemaForVariants &&
    options.transformSchemaForVariants[variantName]
  )
    // Per-variant transformation
    schema = options.transformSchemaForVariants[variantName](schema);
  if (options.transformSchema)
    // Single (everytime) transformation
    schema = options.transformSchema(schema);
  if (options.strict) schema = schema.strict();
  return schema;
}

/**
 * Generate schema from decorated class for list of variants
 * @param entityClass Entity class
 * @param variantNames Variant names
 * @param options Options
 * @returns Record<string, z.ZodObject>
 */
export function createZodSchemasFromEntity<T>(
  entityClass: new () => T,
  variantNames: string[],
  options: CreateZodSchemaOptions = {},
): Record<string, z.ZodObject<z.ZodRawShape>> {
  const schemaVariants: Record<string, z.ZodObject<z.ZodRawShape>> = {};
  for (const name of variantNames) schemaVariants[name] = createZodSchemaFromEntity(entityClass, name, options);
  return schemaVariants;
}
