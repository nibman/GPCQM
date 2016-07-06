// Athletes.setKeyNames("gpcqm1", ["firstName", "lastName", "athleteID", "dossard", "hrm", "srmPM", "pm", "sc", "team", "gps","objectId"],function(e){});

var dynamicTable = document.getElementById("dynamic-table");
var dynamicTableBody = dynamicTable.getElementsByTagName('tbody')[0];
var rows;
var dynamicTableHead = dynamicTable.getElementsByTagName('thead')[0];
var wrapperTable = document.getElementById('wrapper-table');
var spinner1 = document.getElementsByClassName('spinner')[0];
var spinner2 = document.getElementsByClassName('spinner')[1];
var hideFields = ["athleteID", "dossard", "team", "objectId"];
var objIdPosition;
var hideFieldsPosition = new Array();
var keyNames = new Array();
var addButton = document.getElementById("btn-add");
var form = document.getElementById('frmBiometric');
var formElem = form.elements;
var message = document.getElementById("message");
var rows;

function errorReceived(err)
{
  console.log("errror "+err)
}

Athletes.getKeyNames("gpcqm1", keyNamesReceived);

function keyNamesReceived(keyNamesReceived)
{
  displayHeader(keyNamesReceived);
  keyNames = keyNamesReceived;
  Athletes.getAllAthletes(athletesReceived, errorReceived);
}

function displayHeader(headerName) {
  var tr = document.createElement('tr');
  dynamicTableHead.appendChild(tr);
  for (x = 0; x<headerName.length; x++)
  {
    var th = document.createElement('th');
    var content = headerName[x];
    for (z = 0; z<hideFields.length; z++){
      if (content == hideFields[z])
      {
        th.className += "hideField";
        (content === "objectId") ? objIdPosition = x : null;
        hideFieldsPosition.push(x);
      }
    }
    th.appendChild(document.createTextNode(content));
    tr.appendChild(th)
  }
  dynamicTableHead.appendChild(tr);
}

function addRowHandlers() {
  for (y = 0; y < rows.length; y++) {
    var currentRow = dynamicTableBody.rows[y];
    var createClickHandler = function(row)
    {
      return function() {
        row.classList.toggle('active');
        checkDelete(rows);
      };
    };
    currentRow.onclick = createClickHandler(currentRow);
    // rows[y].addEventListener("change", function(event){
    //   console.log('caca');
    //   var elem = event.target;
    //   console.log(elem.name);
    //   console.log(elem.tagName);
    //   console.log(elem.type);
    //   if(elem.name === "myText"){
    //     console.log(elem.value);
    //   }
    // });

  }
  spinner1.className += " hidden";
  wrapperTable.className = "";
}

function checkDelete()
{
  // console.log(rows.classList.contains('active'));
  console.log(rows);
}

function athletesReceived(a)
{
 for (var i=0; i<a.length; ++i)
 {
    var tr = document.createElement('tr');
    tr.className += 'row-data';
    for (j = 0; j <a[i].length; j++)
    {
      var td = document.createElement('td');
      var content = a[i][j];
      (j == objIdPosition) ? td.className += " objectId": "";
      if (content == undefined || content == "")
      {
        content = '';
        td.className += " empty";
      }
      for (b = 0; b<hideFieldsPosition.length; b++){
        (j == hideFieldsPosition[b]) ? td.className += " hideField": "";
      }
      td.appendChild(document.createTextNode(content));
      tr.appendChild(td);
    }
    dynamicTableBody.appendChild(tr);
 }
  rows = dynamicTableBody.getElementsByTagName("tr");
  addRowHandlers();
}

addButton.addEventListener("click", function()
{
  var options = { "closeOnConfirm": false };
  inst = $('[data-remodal-id=modal]').remodal(options);
  inst.open();
}, false);

function checkform(form) {
  // get all the inputs within the submitted form
  var inputs = form.getElementsByTagName('input');
  for (var i = 0; i < inputs.length; i++)
  {
    if(inputs[i].hasAttribute("required"))
    {
      if(inputs[i].value == "")
      {
        message.style.opacity = "1";
        return false;
      }
    }
  }
  return true;
}


$(document).on('confirmation', '.remodal', function () {
  if (checkform(form))
  {
    spinner2.classList.remove("hidden");
    var fields = {};
    for(var i=0; i<formElem.length; i++)
    {
      fields[formElem[i].name] = formElem[i].value;
    }
    Athletes.createAthlete(fields, athleteCreated, errorReceived);
  }
});


function athleteCreated()
{
  inst.close();
  location.reload();
}

$(document).on('opened', '.remodal', function () {
  document.getElementById("firstName").focus();
});

$(document).on('closed', '.remodal', function (e) {
  message.style.opacity = "0";
  form.reset();
});


function athleteDeleted(a)
{
  console.log('athleteDeleted');
}


