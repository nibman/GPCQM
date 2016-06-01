# Welcome to the Athletes management JS API for Serdy's biometric data collecting toolset.   

## Athletes API overview
This is a very simple and uncompressed JS api to communicate with Serdy's Parse / NodeJS / Epxress server and to edit the athlete list we will be using for the biometrics.  

## Athletes.getAllAthletes  

_include the AthletesClient.js file in your code first_
```
function errorReceived(err)
{
    console.log("errror "+err)
}

function athletesReceived(a)
{
    console.log("athletesReceived "+a.length);
    for (var i=0; i<a.length; ++i)
    {
    console.log(a[i]);
    }  
}

Athletes.getAllAthletes(athletesReceived, errorReceived);
```

## Athletes.createAthlete
_include the AthletesClient.js file in your code first_
```
function errorReceived(err)
{
    console.log("errror "+err)
}

function athleteCreated(a)
{
    console.log("athlete created ");
    // updated athlete is in a  
}

Athletes.createAthlete({firstName:"Allo", lastName:"Yooii"}, athleteCreated, errorReceived);

```
## Athletes.saveAthlete
_include the AthletesClient.js file in your code first_

```
function athleteSaved(a)
{
    console.log("athlete saved ");
}

// The error callback is always optionnal in every methods. 
// We left it empty here to illustrate it. 

Athletes.saveAthlete(athleteID, {lastName:"pouiuiu", team:"Oui"}, athleteSaved);  

```


## Athletes.deleteAthlete
_include the AthletesClient.js file in your code first_

```

function athleteDeleted(a)
{
    
}

Athletes.deleteAthlete(athleteID, athleteDeleted);

```

