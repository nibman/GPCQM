Parse.initialize("gpcqm");
Parse.serverURL = 'http://gpcqm.herokuapp.com/parse'

Athletes = 
 {
    keys:["firstName", "lastName", "athleteID", "dossard", "hrm", "srmPowerMeter", 
            "vectorPowerMeter", "quarqPowerMeter", "speedCadence", "powerMeter", 
            "garminSpeedCadence", "team", "gps", "wheelCir"],
         
    getAthleteByID:function(id, successCB, e)
    {   
        var Athlete = Parse.Object.extend("Athlete");
        var query = new Parse.Query(Athlete);
        query.get(id, 
        { 
            success:function(athlete)
            {
                successCB(athlete);
            },
            error:function(object, error)
            {
               e != null ? e(error) : errorDefault(error);
            }
         });
    },
    getAllAthletes:function(successCB, e)
    {
        var Athlete = Parse.Object.extend("Athlete");
        var query = new Parse.Query(Athlete);
        var k = Athletes.keys;
        query.find( 
        { 
            success:function(object)
            {
                var a = [];
                for (var i=0; i<object.length; ++i)
                {
                    var e =  { };
                    for (var j=0; j<k.length; ++j)
                    {
                        e[k[j]] = object[i].get(k[j]);
                    }
                    a.push(e); 
                }
                successCB(a);
            },
            error:function(object, error)
            {
                e != null ? e(error) : errorDefault(error);
            }
         });
    },
    setAthlete:function(athleteID, athleteObj, successCB, error)
    {
        
    },
    deleteAthlete:function(athleteID)
    {
        
    },
    errorDefault:function(e)
    {
        console.log("Error "+e);
    }
};