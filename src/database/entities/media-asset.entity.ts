import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('media_assets')
export class MediaAsset {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'line_user_id' })
    lineUserId: string;

    @Column({ name: 'line_message_id' })
    lineMessageId: string;

    @Column()
    type: string; // e.g., 'image'

    @Column({ name: 'cloudinary_url', nullable: true })
    cloudinaryUrl: string;

    @Column({ name: 'cloudinary_public_id', nullable: true })
    cloudinaryPublicId: string;

    @Column('jsonb', { nullable: true })
    metadata: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
