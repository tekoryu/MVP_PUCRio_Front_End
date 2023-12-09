/*
  --------------------------------------------------------------------------------------
  Function to fill the div content with html from another page.
  This part of the code will not be DRY efficient, cause I'm still experimenting
  with JScript.
  --------------------------------------------------------------------------------------
*/

// Get the elements. TODO: find a way to declare the variables below inside a
//                         function in a reasonable way
var contentDiv = document.getElementById('content');
var projectsLink = document.getElementById('projects-link');

// Add click event listener to the projects link
projectsLink.addEventListener('click', function (event) {
    // Prevent the default behavior of the link
    event.preventDefault();

    // Fetch content from projects.html
    fetch('/projects.html')
        .then(response => response.text())
        .then(data => {
            // Update the content with the fetched data
            contentDiv.innerHTML = data;
            //Populates table
            getList()
        })
        .catch(error => {
            console.error('Não foi possível carregar', error);
        });
});
/*
  --------------------------------------------------------------------------------------
  Função para obter a lista existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getList = async () => {
  let url = 'http://127.0.0.1:5000/projects';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.projects.forEach(item => insertList(item.name, item.description))
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
/*
  --------------------------------------------------------------------------------------
  Chamada da função para carregamento inicial dos dados
  --------------------------------------------------------------------------------------
*/


/*
  --------------------------------------------------------------------------------------
  Função para criar um botão close para cada item da lista
  --------------------------------------------------------------------------------------
*/
const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);
}
/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (nameProject, description) => {
  var item = [nameProject, description]
  var table = document.getElementById('tbl_projetos');
  var row = table.insertRow();

  for (var i = 0; i < item.length; i++) {
    var cel = row.insertCell(i);
    cel.textContent = item[i];
  }
  insertButton(row.insertCell(-1))
  document.getElementById("newInput").value = "";
  document.getElementById("newQuantity").value = "";
  document.getElementById("newPrice").value = "";

  removeElement()
}
