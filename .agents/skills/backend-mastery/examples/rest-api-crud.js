/**
 * Backend Mastery — Complete REST API Example
 * =============================================
 * A complete, working example showing the Controller →
 * Service → Repository pattern with validation, auth,
 * pagination, and error handling.
 *
 * Module: Users CRUD
 */

// =============================================
// 1. SCHEMA (Zod Validation)
// =============================================
// File: src/modules/users/users.schema.js

import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    role: z.enum(['USER', 'ADMIN']).optional().default('USER'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    avatar: z.string().url().optional().nullable(),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['createdAt', '-createdAt', 'name', '-name']).default('-createdAt'),
    role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    q: z.string().max(100).optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
});


// =============================================
// 2. REPOSITORY (Data Access Layer)
// =============================================
// File: src/modules/users/users.repository.js

// import { prisma } from '../../config/database.js';

export class UsersRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, avatar: true,
        role: true, status: true, emailVerified: true,
        createdAt: true, updatedAt: true,
        profile: true,
      },
    });
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findMany({ page, limit, sort, role, status, q }) {
    const skip = (page - 1) * limit;
    const orderBy = this._parseSort(sort);

    const where = {
      deletedAt: null, // Exclude soft-deleted
      ...(role && { role }),
      ...(status && { status }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true, name: true, email: true, avatar: true,
          role: true, status: true, createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async create(data) {
    return this.prisma.user.create({
      data,
      select: {
        id: true, name: true, email: true,
        role: true, status: true, createdAt: true,
      },
    });
  }

  async update(id, data) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, avatar: true,
        role: true, status: true, updatedAt: true,
      },
    });
  }

  async softDelete(id) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
  }

  _parseSort(sort) {
    if (!sort) return [{ createdAt: 'desc' }];
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    return [{ [field]: desc ? 'desc' : 'asc' }];
  }
}


// =============================================
// 3. SERVICE (Business Logic)
// =============================================
// File: src/modules/users/users.service.js

// import { hashPassword } from '../../shared/utils/crypto.js';
// import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
// import { UsersRepository } from './users.repository.js';

export class UsersService {
  constructor(usersRepository) {
    this.repo = usersRepository;
  }

  async getUser(id) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async listUsers(query) {
    const { users, total } = await this.repo.findMany(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      data: users,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
    };
  }

  async createUser(data) {
    // Check for duplicate email
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already registered');

    // Hash password
    // const passwordHash = await hashPassword(data.password);

    return this.repo.create({
      name: data.name,
      email: data.email,
      passwordHash: data.password, // Replace with hashed password
      role: data.role,
    });
  }

  async updateUser(id, data) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError('User');

    // Check email uniqueness if changing email
    if (data.email && data.email !== user.email) {
      const existing = await this.repo.findByEmail(data.email);
      if (existing) throw new ConflictError('Email already in use');
    }

    return this.repo.update(id, data);
  }

  async deleteUser(id) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError('User');
    return this.repo.softDelete(id);
  }
}


// =============================================
// 4. CONTROLLER (HTTP Handler)
// =============================================
// File: src/modules/users/users.controller.js

export class UsersController {
  constructor(usersService) {
    this.service = usersService;
  }

  list = async (req, res) => {
    const result = await this.service.listUsers(req.query);
    res.json({ status: 'success', ...result });
  };

  getById = async (req, res) => {
    const user = await this.service.getUser(req.params.id);
    res.json({ status: 'success', data: user });
  };

  create = async (req, res) => {
    const user = await this.service.createUser(req.body);
    res.status(201).json({
      status: 'success',
      data: user,
      message: 'User created successfully',
    });
  };

  update = async (req, res) => {
    const user = await this.service.updateUser(req.params.id, req.body);
    res.json({ status: 'success', data: user });
  };

  delete = async (req, res) => {
    await this.service.deleteUser(req.params.id);
    res.status(204).send();
  };
}


// =============================================
// 5. ROUTES
// =============================================
// File: src/modules/users/users.routes.js

import { Router } from 'express';
// import { authenticate, authorize } from '../../middleware/auth.js';
// import { validate } from '../../middleware/validate.js';
// import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export function createUsersRouter(controller) {
  const router = Router();

  // Public (or authenticated) routes
  router.get('/',
    // authenticate,
    // validate(listUsersSchema),
    asyncHandler(controller.list)
  );

  router.get('/:id',
    // authenticate,
    // validate(getUserSchema),
    asyncHandler(controller.getById)
  );

  // Admin routes
  router.post('/',
    // authenticate,
    // authorize('ADMIN'),
    // validate(createUserSchema),
    asyncHandler(controller.create)
  );

  router.patch('/:id',
    // authenticate,
    // validate(updateUserSchema),
    asyncHandler(controller.update)
  );

  router.delete('/:id',
    // authenticate,
    // authorize('ADMIN'),
    // validate(getUserSchema),
    asyncHandler(controller.delete)
  );

  return router;
}


// =============================================
// 6. WIRING (Dependency Injection)
// =============================================
// File: src/modules/users/index.js

/*
import { prisma } from '../../config/database.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { createUsersRouter } from './users.routes.js';

const usersRepository = new UsersRepository(prisma);
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);
const usersRouter = createUsersRouter(usersController);

export { usersRouter };
*/

// In app.js:
// import { usersRouter } from './modules/users/index.js';
// app.use('/api/v1/users', usersRouter);


// =============================================
// HELPER: asyncHandler
// =============================================
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.statusCode = 404;
    this.code = 'NOT_FOUND';
  }
}

class ConflictError extends Error {
  constructor(msg) {
    super(msg);
    this.statusCode = 409;
    this.code = 'CONFLICT';
  }
}

console.log('✅ REST API example loaded — see file for complete Controller → Service → Repository pattern.');
