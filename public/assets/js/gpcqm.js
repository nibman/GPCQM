var Serdy = {};

Serdy.isLoggedIn = function()
{
    var currentUser = Parse.User.current();
    return currentUser != null ? true : false; 
}

Serdy.logIn = function(uname, pwd)
{
    Parse.User.logIn(uname, pwd, 
    {
        success: function(user) 
        {
           console.log("logIn success");
        },
        error: function(user, error) 
        {
           console.log("logIn failed");
        }
    });
}

Serdy.logOut = function()
{
    Parse.User.logOut().then(() => {
        var currentUser = Parse.User.current();
    });
} 

Serdy.createUser = function(uname, pwd)
{
    var user = new Parse.User();
    user.set("username", uname);
    user.set("password", pwd);
    
    user.signUp(null, 
    {
        success: function(user) 
        {
            console.log("User created");
        },
        error: function(user, error) 
        {
            console.log("User creation error "+error.code + " " +error.message );
        }
    });
}