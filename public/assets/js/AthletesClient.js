Parse.initialize("gpcqm");
Parse.serverURL = 'http://gpcqm.herokuapp.com/parse'


var Athletes = 
{
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
        
        query.find( 
        { 
            success:function(object)
            {
                successCB(object);
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