import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { z } from 'zod';

import { ZodProperty } from '../src/index.js';

@Entity()
export class TestEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  @ZodProperty({ schema: z.number().min(0) })
  id!: number;

  @Column()
  @ZodProperty({ schema: z.string().min(1).max(255) })
  name!: string;
}
