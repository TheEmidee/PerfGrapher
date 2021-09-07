let mongoose = require('mongoose'),
  express = require('express'),
  router = express.Router(),
  papa = require('papaparse'),
  fs = require('fs'),
  path = require("path");

// project Model
let projectSchema = require('../models/project');
let dataSchema = require('../models/data');

// CREATE project
router.route('/create-project').post((req, res, next) => {
  projectSchema.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// READ projects
router.route('/').get((req, res) => {
  projectSchema.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

router.route('/get-maps/:project_name').get((req, res) => {
  dataSchema
    .find( { "project": req.params.project_name }, "map" )
    .distinct( 'map', (error, data) => {
      if (error) {
        return next(error)
      }

      res.json( data );
    })
})

router.route('/get-map-stats/:project_name/:map_name').get((req, res) => {
  dataSchema
    .find( { "project": req.params.project_name, "map": req.params.map_name } )
    .sort( { "date": "descending" } )
    .limit( 50 )
    .exec( (error, data) => {
      if (error) {
        return next(error)
      }
      
      res.json( data );
    })
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

router.route('/data-details/:project_name/:map_name/:sha').get((req,res,next) => {
  dataSchema.findOne(
    { 
      "project": req.params.project_name,
      "map": req.params.map_name,
      "sha": req.params.sha 
    },
    ( error, data ) => {
      if (error) {
        return next(error);
      }

      res.json( data )
    }
  )
})

router.route('/add-perf-data/').post((req, res, next) => {
  const projectName = req.query.project_name;
  const mapName = req.query.map;
  const sha = req.query.sha;

  if ( !projectName || !mapName || !sha ) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const filesFolder = process.env.FILES_UPLOAD_FOLDER || __dirname + "/../../public/files/";
  const filePrefix = `${projectName}_${mapName}_${sha}`;
  const summaryFile = req.files.summary;
  const summaryFilename = `${filePrefix}_${summaryFile.name}`;
  const summaryFullPath = path.join( filesFolder, summaryFilename );

  const graphFile = req.files.graph;
  const graphFileName = `${filePrefix}_${graphFile.name}`;
  const graphFullPath = path.join( filesFolder, graphFileName );

  const metricsFile = req.files.metrics;
  const metricsFileName = `${filePrefix}_${metricsFile.name}`;
  const metricsFullPath = path.join( filesFolder, metricsFileName );

  summaryFile.mv( summaryFullPath );
  metricsFile.mv( metricsFullPath );
  graphFile.mv( graphFullPath );

  const file = fs.createReadStream( summaryFullPath );

  if ( !file ) {
    return res.json({ message: "Impossible to read the summary file", code: 500 });
  }

  const addToMongo = ( mongo_data ) => {
    return projectSchema.findOne( 
      { name: mongo_data.project_name }, 
      ( error, project_data ) => {
        if (error) {
          return next(error);
        }
        var result = { success: false, error: "" }

        if ( project_data == null ) {
          return next( "The project does not exist" );
        }

        const new_data = new dataSchema({
          _id: new mongoose.Types.ObjectId(),
          project: project_data.name,
          map: mongo_data.map_name,
          sha: sha,
          date: Date.now(),
          ReportName: mongo_data.report_path,
          stats: mongo_data.stats
        });

        new_data.save( function (err) {
          if (err) {
            return next(err);
          }

          return res.json( result );
        });
      });
  }

  const getJsonFromCSV = ( csv_data ) => {
    const map = new Map();
    const data = csv_data.data;
    const header_row = data[ 0 ]; 
    const value_row = data[ 1 ]; 
    const col_count = header_row.length - 1;

    for (let col_index = 1; col_index < col_count; col_index++) {
      map.set( header_row[ col_index ], value_row[ col_index ] );
    }

    const autoConvertMapToObject = (map) => {
      const obj = {};
      for (const item of [...map]) {
        const [
          key,
          value
        ] = item;
        obj[key] = value;
      }
      return obj;
    }
    
    const result = autoConvertMapToObject(map)

    return result;
  }

  papa.parse(file, {
      complete: function( results, file ) {
        let metrics_raw_data = fs.readFileSync( metricsFullPath );
        let metrics = JSON.parse( metrics_raw_data );

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
        
        const flattenMetrics = flattenMetricsJson( metrics );
        let stats = getJsonFromCSV( results );
        let merged_stats = { ...stats, ...flattenMetrics };

        var mongo_data = {
          project_name: projectName,
          map_name: mapName,
          stats : merged_stats,
          report_path: graphFileName
        };

        fs.unlinkSync( summaryFullPath );
        fs.unlinkSync( metricsFullPath );

        return addToMongo( mongo_data )
      },
      err: function( err, file ) {
        if (err) {
          return next( err )
        }
      }
  });
})

// Delete project
router.route('/delete-project/:project_name').delete((req, res, next) => {
  projectSchema.findOneAndRemove( { name: req.params.project_name }, (error, data) => {
    if (error) {
      return next(error);
    }

    dataSchema.deleteMany( { project: req.params.project_name }, ( err, data ) => {
      if (error) {
        return next(error);
      }
      
      res.json( { "success" : "ok" });
    });
  })
})

// Delete project map
router.route('/delete-map/:project_name/:map_name').delete((req, res, next) => {
  dataSchema.deleteMany( { project: req.params.project_name, map: req.params.map_name }, ( err, data ) => {
    if (err) {
      return next(err);
    }
    
    res.json( { "success" : "ok" });
  })
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