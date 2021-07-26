const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let dataSchema = new Schema( {
  project: { type: String },
  map: { type: String },
  sha: { type: String },
  date: { type: Date },
  "ReportName" : { type: String },
  stats: Schema.Types.Mixed
  // {
  //   "Hitches/Min": { type: Number },
  //   "HitchTimePercent": { type: Number },
  //   "MVP60": { type: Number },
  //   "Frametime Avg": { type: Number },
  //   "GameThreadtime Avg": { type: Number },
  //   "RenderThreadtime Avg": { type: Number },
  //   "GPUtime Avg": { type: Number },
  //   "RHI/Drawcalls Avg": { type: Number },
  //   "MemoryFreeMB Min": { type: Number },
  //   "PhysicalUsedMB Max": { type: Number },
  //   "Basic/TicksQueued Avg": { type: Number }
  // },
  // metrics: Schema.Types.Mixed
}, 
{
    collection: 'data'
});

module.exports = mongoose.model('Data', dataSchema)