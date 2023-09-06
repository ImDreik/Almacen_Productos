import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import { emailValidation } from '../middlewares/validateEmail.js';
import { createAccesToken } from '../libs/jwt.js'

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    const isDuplicated = await emailValidation(email);

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        if (isDuplicated) {
            res.status(400).json({ message: 'Este correo ya existe' });
            return;
        }

        const [result] = await pool.query('INSERT INTO usuarios (username, email, password) VALUES (?, ?, ?)', [username, email, passwordHash]);
        const token = await createAccesToken({ id: result.insertId });

        res.cookie('token', token)
        res.json({ messege: 'User created successfully👍' })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const [userFound] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        if (userFound.length === 0) return res.status(404).json({ message: 'User not found' });

        const isMatchs = await bcrypt.compare(password, userFound[0].password);

        if (!isMatchs) return res.status(400).json({ message: 'Incorrect password' });

        const token = await createAccesToken({ id: userFound[0].id });

        res.cookie('token', token);
        res.json({ message: 'Successfully logged in' })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const logout = (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0)
    })
    res.sendStatus(200)
}

export const profile = async (req, res) => {
    try {
        const [userFound] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [req.user.id]);

        if (userFound.length === 0) return res.status(404).json({ message: 'User not found' });

        

        return res.json({
            id: userFound[0].id,
            username: userFound[0].username,
            email: userFound[0].email,
            createdAt: userFound[0].createdAt,
            updatedAt: userFound[0].updatedAt
        })

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}