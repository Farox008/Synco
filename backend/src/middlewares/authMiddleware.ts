import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback_secret', async (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
      }

      const employee = await prisma.employee.findUnique({
        where: { id: user.id }
      });

      if (!employee || employee.accountStatus !== 'active') {
        return res.status(403).json({ message: 'Forbidden: Account is inactive or does not exist' });
      }

      (req as any).user = employee;
      next();
    });
  } else {
    // Check for Trusted IP Auto-Login
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const trustedIps = process.env.TRUSTED_IP ? process.env.TRUSTED_IP.split(',') : [];

    if (clientIp && typeof clientIp === 'string' && trustedIps.includes(clientIp)) {
      // Find the first active admin to log in as
      const employee = await prisma.employee.findFirst({
        where: { accountStatus: 'active' }
      });

      if (employee) {
        const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_secret';
        const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

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

        (req as any).user = employee;
        return next();
      }
    }

    res.status(401).json({ message: 'Unauthorized: Missing token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role) {
      return res.status(403).json({ message: 'Forbidden: Role not found' });
    }
    
    // Super Admin has access to everything
    if (user.role === 'Super Admin') {
      return next();
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
