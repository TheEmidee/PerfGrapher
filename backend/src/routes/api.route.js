const mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router(),
  fs = require('fs'),
  path = require("path");

const fsPromises = fs.promises;

  // project Model
let projectSchema = require('../models/project');
let dataSchema = require('../models/data');

router.route('/').get( async ( req, res, next ) => {
  try {
    res.json( {} );
  } catch ( err ) {
    return next( err )
  }
})

router.route('/get-projects').get( async ( req, res, next ) => {
  try {
    res.json( await projectSchema.find().sort( { "name": "ascending" } ) );
  } catch ( err ) {
    return next( err )
  }
})

router.route('/create-project').post( async (req, res, next) => {
  try {
    const data = await projectSchema.create( req.body );
    res.json( data );
  } catch ( err ) {
    return next( error );
  }
});

router.route('/get-maps/:project_name').get( async ( req, res, next ) => {
  try {
    res.json( await dataSchema
      .find( { "project": req.params.project_name }, "map" )
      .distinct( 'map' ) );
  } catch ( err ) {
    return next( err );
  }
})

router.route('/get-map-stats/:project_name/:map_name').get( async ( req, res, next ) => {
  try {
    return res.json( await dataSchema
      .find( { "project": req.params.project_name, "map": req.params.map_name } )
      .sort( { "date": "ascending" } )
      .limit( 50 ) );
  } catch ( err ) {
    return next( err );
  }
});

router.route('/get-map-locations/:project_name/:map_name').get((req, res) => {
  projectSchema.findOne(
    { "name": req.params.project_name },
    (error, data) => {
      if (error) {
        return next(error)
      } else {
        for (var i = 0; i < data.maps.length; i++){
          if (data.maps[i].name == req.params.map_name){
            var locations = []

            if ( data.maps[i].locations ) {
              for ( var j = 0; j < data.maps[i].locations.length; j++ ) {
                locations.push(
                  {
                    name: data.maps[i].locations[j].name,
                    lastcounters: data.maps[i].locations[j].lastcounters
                  }
                )
              }
            }
            res.json(locations);
            break;
          }
        }
      }
    })
})

router.route('/get-location-data/:project_name/:map_name/:location_name').get((req, res) => {
  projectSchema.findOne(
    { "name": req.params.project_name },
    (error, data) => {
      if (error) {
        return next(error)
      } else {
        var result = {
          "project" : req.params.project_name,
          "map" : req.params.map_name,
          "location" : req.params.location_name,
          "bugitgolocation" : "",
          "counters" : []
        }
        
        for (var i = 0; i < data.maps.length; i++){
          if (data.maps[i].name == req.params.map_name){
            for ( var j = 0; j < data.maps[i].locations.length; j++ ) {
              if ( data.maps[i].locations[j].name == req.params.location_name ) {
                result.bugitgolocation = data.maps[i].locations[j].bugitgolocation
                result.counters = data.maps[i].locations[j].counters
                res.json( result )
                return
              }
            }
          }
        }

        res.json( result )
      }
    })
})

router.route('/data-details/:project_name/:map_name/:sha').get( async ( req, res, next ) => {
  try {
    const result = await dataSchema.findOne(
      { 
        "project": req.params.project_name,
        "map": req.params.map_name,
        "sha": req.params.sha 
      }).lean()

    const project = await projectSchema.findOne( { name: req.params.project_name } )

    res.json( {
      project: project,
      data_details: result
    } );
  } catch ( err ) {
    return next( err );
  }
})

router.route('/add-perf-data/').post( async ( req, res, next ) => {
  const projectName = req.query.project_name;
  const mapName = req.query.map;
  const sha = req.query.sha;

  if ( !projectName || !mapName || !sha ) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const projectData = await projectSchema.findOne( { name: projectName } );

  if ( !projectData ) {
    return res.status(400).json( { error: `Could not find project ${projectName}` } )
  }

  const filesFolder = process.env.FILES_UPLOAD_FOLDER || __dirname + "/../../../frontend/public/files/";
  const filePrefix = `${projectName}_${mapName}_${sha}`;
  
  const summaryFile = req.files.summary;
  const metricsFile = req.files.metrics;
  const hitchesFile = req.files.hitches;
  
  const graphFile = req.files.graph;
  const graphFullPath = path.join( filesFolder, `${filePrefix}.html` );

  try {
    await fsPromises.copyFile( graphFile.tempFilePath, graphFullPath );
    
    async function parseJSONFile( file_path ) {
      const dataBuffer = await fsPromises.readFile( file_path );
      return JSON.parse( dataBuffer );
    }

    const metricsJSON = await parseJSONFile( metricsFile.tempFilePath );
    const statsJSON = await parseJSONFile( summaryFile.tempFilePath );
    const hitchesJSON = await parseJSONFile( hitchesFile.tempFilePath );

    const flattenMetricsJson = (data) => {
      var result = {};
      function recurse (cur, prop) {
          if (Object(cur) !== cur) {
              result[prop] = cur;
          } else if (Array.isArray(cur)) {
              for(var i=0, l=cur.length; i<l; i++)
                  recurse(cur[i], prop + "[" + i + "]");
              if (l == 0)
                  result[prop] = [];
          } else {
              var isEmpty = true;
              for (var p in cur) {
                  isEmpty = false;
                  recurse(cur[p], prop ? prop+"_"+p : p);
              }
              if (isEmpty && prop)
                  result[prop] = {};
          }
      }
      recurse(data, "");
      return result;
    }

    const cleanStatsJSON = ( data ) => {
      let result = data[ 0 ];
      delete result[ "Section Name" ];
      return result;
    }

    const flattenedMetricsJSON = flattenMetricsJson( metricsJSON );
    const cleanedStatsJSON = cleanStatsJSON( statsJSON );

    const newData = new dataSchema({
      _id: new mongoose.Types.ObjectId(),
      project: projectName,
      map: mapName,
      sha: sha,
      date: Date.now(),
      metrics: flattenedMetricsJSON,
      stats: cleanedStatsJSON,
      hitches: hitchesJSON
    });

    await newData.save();

    return res.json( { success: true } );
  } catch ( err ) {
    return next( err );
  }
})

router.route( '/delete-data-entry/:entry_id' ).delete( async( req, res, next ) => {
  try {
    const dataItem = await dataSchema.findOne( { _id: req.params.entry_id } )

    if ( !dataItem ) {
      return res.json( { "success" : "no data entry" } )
    }

    try {
      const filesFolder = process.env.FILES_UPLOAD_FOLDER || __dirname + "/../../../frontend/public/files/";
      const filePrefix = `${dataItem.project}_${dataItem.map}_${dataItem.sha}`;
      const graphFullPath = path.join( filesFolder, `${filePrefix}.html` );

      await fsPromises.unlink( graphFullPath )
    }
    finally {
      await dataSchema.deleteOne( { _id: req.params.entry_id } );
    }

    res.json( { "success" : "ok" });
  } catch ( err ) {
    return next( err );
  }
})

// Delete project
router.route('/delete-project/:project_name').delete( async ( req, res, next ) => {
  try {
    await projectSchema.findOneAndRemove( { name: req.params.project_name } );
    await dataSchema.deleteMany( { project: req.params.project_name } );

    res.json( { "success" : "ok" });
  } catch ( err ) {
    return next( err );
  }
})

router.route('/delete-map/:project_name/:map_name').delete( async ( req, res, next ) => {
  try {
    await dataSchema.deleteMany( { project: req.params.project_name, map: req.params.map_name } );

    res.json( { "success" : "ok" });
  } catch ( err ) {
    return next( err )
  }
})

router.route('/delete-map-location/:project_name/:map_name/:location_name').delete((req, res, next) => {
  projectSchema.updateOne( 
    { _id: req.params.project_name },
    {
      $pull : {
        maps : { _id: req.params.map_name }
      }
    },
    (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})

module.exports = router;