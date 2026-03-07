// models/Url.js
// URL model — core entity storing original URLs and their short codes

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Url = sequelize.define(
  'Url',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    original_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
        len: [10, 2048],
      },
    },
    short_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20],
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Optional title for the link (for dashboard display)',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Guest users can create URLs
      references: {
        model: 'users',
        key: 'id',
      },
    },
    click_count: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
      comment: 'Cached count — updated asynchronously from analytics table',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Soft delete — inactive URLs return 404',
    },
    is_custom: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether the short code was user-defined',
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Optional password protection for the URL',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'NULL means never expires',
    },
    last_accessed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Flexible metadata: tags, utm params, etc.',
    },
  },
  {
    tableName: 'urls',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      // Primary lookup index — most critical for redirect performance
      { unique: true, fields: ['short_code'], name: 'idx_urls_short_code' },
      // Filter by user
      { fields: ['user_id'], name: 'idx_urls_user_id' },
      // Expiry cleanup jobs
      { fields: ['expires_at'], name: 'idx_urls_expires_at' },
      // Active URL filter
      { fields: ['is_active'], name: 'idx_urls_is_active' },
      // Composite for user dashboard queries
      { fields: ['user_id', 'is_active', 'created_at'], name: 'idx_urls_user_active_created' },
    ],
  }
);

/**
 * Check if a URL has expired
 * @returns {boolean}
 */
Url.prototype.isExpired = function () {
  return this.expires_at && new Date() > new Date(this.expires_at);
};

module.exports = Url;
