import 'reflect-metadata';

import { describe, expect, test } from 'vitest';

import { createZodSchemaFromEntity, ZOD_SCHEMA_PROPERTY, type ZodPropertyMetadata } from '../src/index.js';
import { EntityBase, TestEntity } from './inheritance.entity.js';

describe('basic', () => {
  const schema = createZodSchemaFromEntity(TestEntity);

  test('schema should be defined', () => {
    expect(schema).toBeDefined();
  });

  test('schema should have keys', () => {
    const keys = Object.keys(schema.shape);

    expect(keys).toContain('id');
    expect(keys).toContain('name');
    expect(keys).toContain('baseProperty');
  });

  test('validate valid data', () => {
    const data = {
      id: 1,
      name: 'John Doe',
      baseProperty: 'test',
    };

    const result = schema.safeParse(data);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('John Doe');
      expect(result.data.baseProperty).toBe('test');
    }
  });

  test('validate invalid data', () => {
    const data = {
      id: -1,
      name: 'John Doe',
    };

    const result = schema.safeParse(data);
    expect(result.success).toBe(false);

    if (!result.success) {
      const issues = result.error.issues || [];
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some((e) => e.path.includes('id'))).toBe(true);
      expect(issues.some((e) => e.path.includes('baseProperty'))).toBe(true);
    }
  });

  test('no property spill child <-> base class', () => {
    const baseProperties: string[] =
      Reflect.getMetadata(ZOD_SCHEMA_PROPERTY, EntityBase)?.map((v: ZodPropertyMetadata) => v.propertyKey) ?? [];
    const childProperties: string[] =
      Reflect.getMetadata(ZOD_SCHEMA_PROPERTY, TestEntity)?.map((v: ZodPropertyMetadata) => v.propertyKey) ?? [];

    expect(baseProperties).toContain('baseProperty');
    expect(baseProperties).not.toContain('id');
    expect(baseProperties).not.toContain('name');
    expect(childProperties).toContain('baseProperty');
    expect(childProperties).toContain('id');
    expect(childProperties).toContain('name');
  });
});
