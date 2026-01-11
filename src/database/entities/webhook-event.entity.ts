import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('webhook_events')
export class WebhookEvent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('jsonb')
    payload: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
