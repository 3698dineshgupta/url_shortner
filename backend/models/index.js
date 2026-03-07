// models/index.js
// Central model registry — defines associations between models

const User = require('./User');
const Url = require('./Url');
const Analytics = require('./Analytics');

// ============================
// Associations
// ============================

// A User has many URLs
User.hasMany(Url, {
  foreignKey: 'user_id',
  as: 'urls',
  onDelete: 'CASCADE',
});

// Each URL belongs to a User (optional — guest URLs have null user_id)
Url.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'owner',
});

// A URL has many Analytics events
Url.hasMany(Analytics, {
  foreignKey: 'url_id',
  as: 'clicks',
  onDelete: 'CASCADE',
});

// Each Analytics event belongs to a URL
Analytics.belongsTo(Url, {
  foreignKey: 'url_id',
  as: 'url',
});

module.exports = { User, Url, Analytics };
