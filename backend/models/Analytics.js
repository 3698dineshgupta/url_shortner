// models/Analytics.js
// Stores individual click events for detailed analytics reporting

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analytics = sequelize.define(
  'Analytics',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    url_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'urls',
        key: 'id',
      },
    },
    short_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Denormalized for fast querying without joins',
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true,
      comment: 'IPv4 or IPv6 of the visitor',
    },
    ip_hash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      comment: 'Hashed IP for unique visitor counting (privacy-safe)',
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    referer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'HTTP Referer header',
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: 'ISO 3166-1 alpha-2 country code (from IP geolocation)',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    device_type: {
      type: DataTypes.ENUM('desktop', 'mobile', 'tablet', 'bot', 'unknown'),
      defaultValue: 'unknown',
    },
    browser: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    os: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    clicked_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: 'analytics',
    timestamps: false, // Using clicked_at instead
    indexes: [
      // Most common query: analytics for a specific URL
      { fields: ['url_id'], name: 'idx_analytics_url_id' },
      { fields: ['short_code'], name: 'idx_analytics_short_code' },
      // Time-range queries for dashboards
      { fields: ['clicked_at'], name: 'idx_analytics_clicked_at' },
      // Composite for time-series analytics
      { fields: ['short_code', 'clicked_at'], name: 'idx_analytics_code_time' },
      // Country/device breakdown queries
      { fields: ['url_id', 'country'], name: 'idx_analytics_url_country' },
      { fields: ['url_id', 'device_type'], name: 'idx_analytics_url_device' },
    ],
  }
);

module.exports = Analytics;
