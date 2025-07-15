import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('admin')
export class Admin {
    @PrimaryColumn({ name: 'id', type: 'varchar', length: 255 })
    id: string;

    @Column({ name: 'username', type: 'varchar', length: 255 })
    username: string;

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ name: 'status', type: 'int' })
    status: number;
}