import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'to_email', type: 'varchar', length: 255 })
  toEmail: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ name: 'template_key', type: 'varchar', length: 100, nullable: true })
  templateKey: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
