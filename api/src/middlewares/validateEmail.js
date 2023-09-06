import { pool } from "../db.js"

export const emailValidation = async (email) => {
    try {
        const [result] = await pool.query('SELECT EXISTS (SELECT 1 FROM usuarios WHERE email = ?) AS duplicated_email', [email]);

        const isDuplicated = result[0].duplicated_email === 1 ? true : false;

        return isDuplicated;
    } catch (error) {
        console.log(error)
    }
}