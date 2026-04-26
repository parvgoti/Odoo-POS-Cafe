/**
 * Database Mastery — MongoDB Patterns (Mongoose 8)
 * Production-ready schema, queries, and aggregation (2026)
 */

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// =============================================
// CONNECTION
// =============================================
export async function connectMongoDB(uri) {
  await mongoose.connect(uri || process.env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB connected');
}

// =============================================
// USER SCHEMA
// =============================================
const userSchema = new Schema({
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:  { type: String, required: true, select: false },
  name:          { type: String, required: true, trim: true, maxlength: 100 },
  avatarUrl:     String,
  role:          { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  status:        { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  loginCount:    { type: Number, default: 0 },
  lastLoginAt:   Date,
  profile: {
    bio:      { type: String, maxlength: 500 },
    website:  String,
    location: String,
    company:  String,
    social:   { twitter: String, github: String, linkedin: String },
  },
  preferences: {
    theme:         { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: { type: Boolean, default: true },
    language:      { type: String, default: 'en' },
  },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.__v;
      delete ret.passwordHash;
      return ret;
    },
  },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ name: 'text', email: 'text' });

// Middleware: auto-exclude soft deleted
userSchema.pre(/^find/, function () {
  if (!this.getOptions().includeSoftDeleted) {
    this.where({ deletedAt: null });
  }
});

// Methods
userSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  this.status = 'suspended';
  return this.save();
};

// Statics
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

export const User = model('User', userSchema);

// =============================================
// POST SCHEMA (with embedded comments)
// =============================================
const commentSubSchema = new Schema({
  content:   { type: String, required: true, maxlength: 2000 },
  authorId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parentId:  Schema.Types.ObjectId,
  likes:     [{ type: Schema.Types.ObjectId, ref: 'User' }],
  deletedAt: Date,
}, { timestamps: true });

const postSchema = new Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  content:     { type: String, required: true },
  excerpt:     { type: String, maxlength: 300 },
  status:      { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: Date,
  viewCount:   { type: Number, default: 0 },
  authorId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tags:        [{ type: String, lowercase: true, trim: true }],
  metadata:    Schema.Types.Mixed,
  comments:    [commentSubSchema],
  deletedAt:   { type: Date, default: null },
}, { timestamps: true });

postSchema.index({ slug: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Post = model('Post', postSchema);

// =============================================
// QUERY EXAMPLES
// =============================================

// Pagination (offset)
export async function getUsers({ page = 1, limit = 20, role, search } = {}) {
  const filter = { deletedAt: null };
  if (role) filter.role = role;
  if (search) filter.$text = { $search: search };

  const skip = (Math.max(page, 1) - 1) * Math.min(limit, 100);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(limit, 100))
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

// Aggregation: Monthly signups
export async function getMonthlySignups(months = 12) {
  return User.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000) },
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    {
      $project: {
        _id: 0,
        month: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] },
        count: 1,
        admins: 1,
      },
    },
  ]);
}

// Aggregation: Posts with author & comment count
export async function getPublishedPosts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  return Post.aggregate([
    { $match: { status: 'published', deletedAt: null } },
    { $sort: { publishedAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { name: 1, avatarUrl: 1 } }],
      },
    },
    { $unwind: '$author' },
    {
      $project: {
        title: 1,
        slug: 1,
        excerpt: 1,
        publishedAt: 1,
        viewCount: 1,
        tags: 1,
        author: 1,
        commentCount: { $size: { $ifNull: ['$comments', []] } },
      },
    },
  ]);
}

// Transaction
export async function createPostWithTags(postData, tagNames) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const post = await Post.create([postData], { session });
    await User.updateOne(
      { _id: postData.authorId },
      { $inc: { 'stats.postCount': 1 } },
      { session }
    );
    await session.commitTransaction();
    return post[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
