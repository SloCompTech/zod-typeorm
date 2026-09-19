import 'reflect-metadata';

import { describe, expect, test } from 'vitest';

import { createZodSchemaFromEntity } from '../src/index.js';
import { TestEntity } from './direct.entity.js';

describe('basic', () => {
  const schema = createZodSchemaFromEntity(TestEntity);

  test('schema should be defined', () => {
    expect(schema).toBeDefined();
  });

  test('schema should have keys', () => {
    const keys = Object.keys(schema.shape);

    expect(keys).toContain('id');
    expect(keys).toContain('name');
  });

  test('validate valid data', () => {
    const data = {
      id: 1,
      name: 'John Doe',
    };

    const result = schema.safeParse(data);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.id).toBe(1);
      expect(result.data.name).toBe('John Doe');
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
    }
  });
});
