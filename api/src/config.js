import { config } from 'dotenv';
config();

export const {
    PORT,
    TOKEN_SECRET 
}  = process.env
