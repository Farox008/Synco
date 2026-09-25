import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

export const login = async (req: Request, res: Response) => {
  try {
    const { employeeId, password } = req.body;

    // MVP constraint: only admin, but using employeeId as username field
    const employee = await prisma.employee.findFirst({
      where: {
        OR: [{ username: employeeId }, { email: employeeId }]
      }
    });

    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (employee.accountStatus === 'locked') {
      return res.status(403).json({ message: 'Account is locked. Contact support.' });
    }

    if (employee.failedLoginAttempts >= 5) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { accountStatus: 'locked' }
      });
      return res.status(403).json({ message: 'Account locked due to too many failed attempts.' });
    }

    const isMatch = await bcrypt.compare(password, employee.passwordHash || '');

    if (!isMatch) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { failedLoginAttempts: employee.failedLoginAttempts + 1 }
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Success
    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        failedLoginAttempts: 0,
        lastLogin: new Date()
      }
    });

    const accessToken = jwt.sign({ id: employee.id, role: employee.role }, ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: employee.id, role: employee.role }, REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15m
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
    });

    res.json({
      user: {
        id: employee.id,
        username: employee.username,
        email: employee.email,
        role: employee.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
      }

      const newAccessToken = jwt.sign({ id: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: '15m' });
      const newRefreshToken = jwt.sign({ id: user.id, role: user.role }, REFRESH_SECRET, { expiresIn: '7d' });

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15m
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
      });

      res.json({ message: 'Tokens refreshed' });
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    lastLogin: user.lastLogin
  });
};
