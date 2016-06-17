
Parse.initialize("gpcqm");
Parse.serverURL = 'http://gpcqm.herokuapp.com/parse'

Athletes = 
 {
    keys:["objectId", "firstName", "lastName", "athleteId", "dossard", "hrm", "srmPowerMeter", 
            "vectorPowerMeter", "quarqPowerMeter", "speedCadence", "powerMeter", 
            "garminSpeedCadence", "team", "gps", "wheelCir"],
    
    resultModel:["firstName", "lastName", "athleteId", "dossard", "hrm", "srmPowerMeter", 
            "powerMeter", "speedCadence", "team", "gps", "objectId"],
    
    returnType:"Array",  // Object
    
    setKeyNames:function(keySetID, keyNames, keyNamesSaved, err)
    {
        var Keys = Parse.Object.extend("Keys");
        var query = new Parse.Query(Keys);
        query.equalTo("keySetID", keySetID);
        query.first( 
        { 
            success:function(object)
            {
                object.set('keyNames', keyNames);
                object.save(null, 
                    {
                        success:function(keys)
                        {
                            Athletes.resultModel = keys.get('keyNames');
                            keyNamesSaved(Athletes.resultModel);
                        },
                        error:function(object, error)
                        {
                            err != null ? err(error) : Athletes.errorDefault(error);
                        }
                    });
            },
            error:function(object, error)
            {
                
            }
        });        
    },
    getKeyNames:function(keySetID, keyNamesReceived, err)
    {
        var Keys = Parse.Object.extend("Keys");
        var query = new Parse.Query(Keys);
        query.equalTo("keySetID", keySetID);
        query.first( 
        { 
            success:function(keys)
            {
                Athletes.resultModel = keys.get('keyNames');
                keyNamesReceived(Athletes.resultModel);
            },
            error:function(object, error)
            {
                err != null ? err(error) : Athletes.errorDefault(error);
            }
        });        
    },    
    getAthleteByID:function(id, successCB, err)
    {   
        var Athlete = Parse.Object.extend("Athlete");
        var query = new Parse.Query(Athlete);
        var k = Athletes.resultModel;
        query.get(id, 
        { 
            success:function(athlete)
            {
                if (Athletes.returnType != "Array")
                {
                    var e =  { };
                    for (var j=0; j<k.length; ++j)
                    {
                        if (e[k[j]] != "objectId")
                            e[k[j]] = Athletes.sanitize(athlete.get(k[j]));
                        else
                           e['objectId'] = athlete.id;
                    };
                     
                }
                else
                {
                    var e = [];
                    for (var j=0; j<k.length; ++j)
                    {
                        if (e[k[j]] != "objectId")
                            e.push(Athletes.sanitize(athlete.get(k[j])));
                        else
                         e.push(athlete.id);    
                    };
                     
                }
                successCB(e);
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
        
        query.find( 
        { 
            success:function(object)
            {
                var a = [];
                var k = Athletes.resultModel;
                if (Athletes.returnType != "Array")
                {
                    for (var i=0; i<object.length; ++i)
                    {
                        var e =  { };
                        for (var j=0; j<k.length; ++j)
                        {
                            if (k[j] != "objectId")
                            {
                                e[k[j]] = Athletes.sanitize(object[i].get(k[j])); 
                            }
                            else
                            {
                               e['objectId'] = object[i].id; 
                            }
                        };
                        a.push(e); 
                    }
                }  
                else
                {
                    for (var i=0; i<object.length; ++i)
                    {
                        var e = [];
                        for (var j=0; j<k.length; ++j)
                        {
                            if (k[j] != "objectId")
                            {
                                e.push(Athletes.sanitize(object[i].get(k[j])));
                            } 
                            else
                            {
                                e.push(object[i].id);
                            }  
                        }
                        a.push(e);
                    }  
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
                            var k = Athletes.resultModel;
                            if (Athletes.returnType != "Array")
                            {
                                var e =  { };
                                for (var j=0; j<k.length; ++j)
                                {
                                    e[k[j]] = Athletes.sanitize(athlete.get(k[j]));
                                };
                                e['objectId'] = athlete.id;
                            }
                            else
                            {
                                var e = [];
                                for (var j=0; j<k.length; ++j)
                                {
                                    e.push(Athletes.sanitize(athlete.get(k[j])));
                                };
                                e.push(athlete.id);
                            }
                            
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
        for(var e in athleteObj)
        {
            if (e != "objectId")
            {
                a.set(e, athleteObj[e]);
            }
        }
        
        a.save(null, {
            success: function(a)
            {
                successCB(a);
            },
            error:function(a, error)
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
    },
    mapResults:function(res)
    {
        
    },
    sanitize:function(e)
    {
        if (typeof e != 'undefined')
            return e;
        
        if (e === null || e == null || e == undefined || e === undefined)
        {
            return "";
        }
        
        return e;
    }
};