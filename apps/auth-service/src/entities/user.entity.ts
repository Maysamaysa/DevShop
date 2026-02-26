import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/database';
import { RefreshToken } from './refresh-token.entity';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens: RefreshToken[];
}
