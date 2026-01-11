import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('job_records')
export class JobRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'line_user_id' })
    lineUserId: string;

    @Column({ name: 'asset_id', nullable: true })
    assetId: number;

    @Column({ name: 'job_type' })
    jobType: string; // 'งานที่ 1', 'งานที่ 2', 'งานที่ 3'

    @Column({ default: 'pending' })
    status: string; // 'pending', 'processing', 'completed'

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
