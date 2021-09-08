const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let dataSchema = new Schema( {
  project: { type: String },
  map: { type: String },
  sha: { type: String },
  date: { type: Date },
  "ReportName" : { type: String },
  metrics: Schema.Types.Mixed,
  hitches: Schema.Types.Mixed,
  stats: Schema.Types.Mixed
}, 
{
    collection: 'data'
});

module.exports = mongoose.model('Data', dataSchema)