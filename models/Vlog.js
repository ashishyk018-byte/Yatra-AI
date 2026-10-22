
const mongoose = require('mongoose');

const vlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    place: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    url: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2048
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vlog', vlogSchema);
