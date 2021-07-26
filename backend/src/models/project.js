const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let projectSchema = new Schema({
  name: { type: String },
  repository: { type: String }
}, 
{
    collection: 'projects'
})

module.exports = mongoose.model('Project', projectSchema)