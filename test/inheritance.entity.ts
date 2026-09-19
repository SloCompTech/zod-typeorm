import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { z } from 'zod';

import { ZodProperty } from '../src/index.js';

export class EntityBase {
  @Column()
  @ZodProperty({ schema: z.string().min(1).max(255) })
  baseProperty!: string;
}

@Entity()
export class TestEntity extends EntityBase {
  @PrimaryGeneratedColumn({ unsigned: true })
  @ZodProperty({ schema: z.number().min(0) })
  id!: number;

  @Column()
  @ZodProperty({ schema: z.string().min(1).max(255) })
  name!: string;
}
