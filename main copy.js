var myForm = document.querySelector('form');
var totalBugsInput = document.getElementById('total-bugs');
var closedBugsInput = document.getElementById('closed-bugs');
var mask = document.getElementById('mask');
var textPercentage = document.getElementById('text-percentage');
var percentage = 0;
var myTextPercentage = 0;

var myRoutes = ['Results_By_Asignee.csv', 'Results_By_Month.csv', 'Results_Average_Totals.csv'];
var requestCount = 0;
var xhr;

function showForm() {
  myForm.classList.add('show');
}

function onFormSubmit(evt) {
  evt.preventDefault();

  var totalBugs = totalBugsInput.value;
  var closedBugs = closedBugsInput.value;
  percentage = (closedBugs / totalBugs) * 100;
  var divHeight = (100 - percentage) * 0.8;

  //mask.style.height =  divHeight + '%';
  TweenLite.to(mask, 1.5, {height: divHeight + '%', ease:Linear.easeIn, onUpdate: onMyTweenUpdate});
}

function onMyTweenUpdate() {
  textPercentage.innerHTML = parseInt(percentage * this.progress(), 10) + '%';
}

function processRequest() {
  if (xhr.readyState == 4 && xhr.status == 200) {
    processString(xhr.responseText);
    requestCount += 1;

    if(requestCount < myRoutes.length) {
      xhr = null;
      makeRequest();
    }
  }
}

function processString(_response) {
  var myTable = document.createElement('TABLE');
  var myTableHead = document.createElement('THEAD');
  var myTableBody = document.createElement('TBODY');
  var rows = _response.split('\n');

  for (var i = 0, j = rows.length; i < j; i += 1) {
    var row = rows[i];
    var rowTag = document.createElement('TR');
    var cells = row.split(',');

    for (var k = 0, l = cells.length; k < l; k += 1) {
      var cellTag = document.createElement('TD');
      var scoreCell = document.createElement('TD');

      cellTag.innerHTML = cells[k];
      scoreCell.classList.add('faces-cell');
      rowTag.appendChild(cellTag);

      if(i != 0) {
        if (cells[l - 1] >= 0) {
          scoreCell.innerHTML = 'J';
          scoreCell.classList.add('happy');
        } else {
          scoreCell.innerHTML = 'G';
          scoreCell.classList.add('sad');
        }
      }

      if (k === l - 1) {
        rowTag.appendChild(scoreCell);
      }
    }

    if(i === 0) {
      myTableHead.appendChild(rowTag);
    } else {
      myTableBody.appendChild(rowTag);
    }
  }

  myTable.appendChild(myTableHead);
  myTable.appendChild(myTableBody);
  document.getElementById('tables-container').appendChild(myTable);
}

function makeRequest() {
  xhr = new XMLHttpRequest()
  xhr.open('GET', myRoutes[requestCount], true);
  xhr.send();
  xhr.onreadystatechange = processRequest;
}

makeRequest();
myForm.addEventListener('submit', onFormSubmit);
