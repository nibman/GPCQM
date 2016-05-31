Parse.initialize("gpcqm");
Parse.serverURL = 'http://gpcqm.herokuapp.com/parse'

Athletes = 
 {
    keys:["objectId", "firstName", "lastName", "athleteID", "dossard", "hrm", "srmPowerMeter", 
            "vectorPowerMeter", "quarqPowerMeter", "speedCadence", "powerMeter", 
            "garminSpeedCadence", "team", "gps", "wheelCir"],
         
    getAthleteByID:function(id, successCB, err)
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
               err != null ? err(error) : Athletes.errorDefault(error);
            }
         });
    },
    getAllAthletes:function(successCB, err)
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
                err != null ? err(error) : Athletes.errorDefault(error);
            }
         });
    },
    saveAthlete:function(athleteID, athleteObj, successCB, err)
    {
        if (athleteID != null)
        {
            var Athlete = Parse.Object.extend("Athlete");
            var query = new Parse.Query(Athlete);
            query.get(athleteID, 
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
                            err != null ? err(error) : Athletes.errorDefault(error);
                        }
                    })
                },
                error:function(object, error)
                {
                    err != null ? err(error) : Athletes.errorDefault(error);
                }
            });
        }
        else
        {
            Athlete.createAthlete(athleteObj,successCB, e);
        }
    },
    createAthlete:function(athleteObj, successCB, err)
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
            error:function(a, err)
            {
                err != null ? err(error) : Athletes.errorDefault(error);
            } 
        });
    },
    deleteAthlete:function(athleteID, successCB, err)
    {
        var Athlete = Parse.Object.extend("Athlete");
            var query = new Parse.Query(Athlete);
            query.get(athleteID, 
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
                            err != null ? err(error) : Athletes.errorDefault(error);
                        }
                    });
                },
                error:function(object, error)
                {
                    err != null ? err(error) : Athletes.errorDefault(error);
                }
            });
    },
    errorDefault:function(e)
    {
        console.log("Error "+e);
    }
};