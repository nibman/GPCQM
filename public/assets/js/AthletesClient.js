Parse.initialize("gpcqm");
Parse.serverURL = 'http://gpcqm.herokuapp.com/parse'

Athletes = 
 {
    keys:["objectId", "firstName", "lastName", "athleteID", "dossard", "hrm", "srmPowerMeter", 
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
                    };
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
    saveAthlete:function(athleteID, athleteObj, successCB, e)
    {
        if (athleteID != null)
        {
            var Athlete = Parse.Object.extend("Athlete");
            var query = new Parse.Query(Athlete);
            query.get(id, 
            { 
                success:function(athlete)
                {
                    for(var e in athleteObj)
                    {
                        if (e != "objectId")
                        {
                            athlete.set(e, athleteObj[e]);
                        }
                    }
                    athlete.save(null, {
                        success:function(athlete)
                        {
                            var k = Athletes.keys;
                            var e =  { };
                            for (var j=0; j<k.length; ++j)
                            {
                                e[k[j]] = athlete.get(k[j]);
                            };
                            successCB(e);
                        },
                        error:function(object, error)
                        {
                            e != null ? e(error) : errorDefault(error);
                        }
                    })
                },
                error:function(object, error)
                {
                    e != null ? e(error) : errorDefault(error);
                }
            });
        }
        else
        {
            Athlete.createAthlete(athleteObj,successCB, e);
        }
    },
    createAthlete:function(athleteObj, successCB, error)
    {
        var Athlete = Parse.Object.extend("Athlete");
        var a = new Athlete();
        for (var e in athleteObj)
        {
            a.set(e, athleteObj[e]);
        }
        
        a.save(null, {
            success: function(a)
            {
                successCB(a);
            },
            error:function(a, e)
            {
                e != null ? e(error) : errorDefault(error);
            } 
        });
    },
    deleteAthlete:function(athleteID)
    {
        var Athlete = Parse.Object.extend("Athlete");
            var query = new Parse.Query(Athlete);
            query.get(id, 
            { 
                success:function(athlete)
                {
                    
                    athlete.destroy({
                        success:function(athlete)
                        {
                            successCB();
                        },
                        error:function(object, error)
                        {
                            e != null ? e(error) : errorDefault(error);
                        }
                    });
                },
                error:function(object, error)
                {
                    e != null ? e(error) : errorDefault(error);
                }
            });
    },
    errorDefault:function(e)
    {
        console.log("Error "+e);
    }
};