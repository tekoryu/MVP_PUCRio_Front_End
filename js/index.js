/*
  ------------------------------------------------------------------------------
  Function to fill the div content with html from another page.
  This part of the code will not be DRY efficient, because I'm still
   experimenting  with JScript. Function getList was called to populate the
    table WHEN the page  is called.
  ------------------------------------------------------------------------------
*/

// Get the elements. TODO: change the scope of the variables contentDiv
//                          and projectsLink (they must be declared inside a
//                          function)
var contentDiv = document.getElementById('content');
var projectsLink = document.getElementById('projects-link');
var current_project = ''
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
            getList();
            // Attach the function to the click event of the <a> element
            document.getElementById('novo_projeto_clique').addEventListener('click', toggleVisibility);
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
      data.projects.forEach(item => insertList(item.id, item.name, item.description, item.date_added))
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

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
const insertList = (projectID, nameProject, description, date_added) => {
  let item = [nameProject, description, date_added]
  let table = document.getElementById('tbl_projetos');
  let row = table.insertRow();

  for (let i = 0; i < item.length; i++) {

    let cel = row.insertCell(i);

      // Aqui os nomes de projeto viram links
    if (i === 0){
      var link = document.createElement('a');
      link.param = encodeURIComponent(projectID); // Ensure proper URL encoding
      link.id = encodeURIComponent('tasks-link')
      link.textContent = nameProject;
      cel.appendChild(link);
    } else {
      // For other cells, set text content directly
      cel.textContent = item[i];
    }
  }

  insertButton(row.insertCell(-1))
  document.getElementById("newProject").value = "";
  document.getElementById("newDescription").value = "";

  removeElement()
}

/*
  --------------------------------------------------------------------------------------
  Função para esconder o formulário de NOVO projeto
  --------------------------------------------------------------------------------------
*/
function toggleVisibility() {
  let myDiv = document.getElementById('novo_formulario');
  let myStyle = getComputedStyle(myDiv)
  // Toggle the visibility of the div
  if (myDiv.style.display === 'none' || myDiv.style.display === '' ) {
    myDiv.style.display = 'block';
  } else {
    myDiv.style.display = 'none';
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para remover um item da lista de acordo com o click no botão close
  --------------------------------------------------------------------------------------
*/
const removeElement = () => {
  let close = document.getElementsByClassName("close");
  // var table = document.getElementById('myTable');
  let i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      let div = this.parentElement.parentElement;
      const nomeItem = div.getElementsByTagName('td')[0].textContent
      if (confirm("Você tem certeza?")) {
        div.remove()
        deleteItem(nomeItem)
        alert("Removido!")
      }
    }
  }
}
/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo projeto com descrição
  --------------------------------------------------------------------------------------
*/
const newItem = () => {
  let inputProject = document.getElementById("newProject").value;
  let inputDescription = document.getElementById("newDescription").value;
  let current_date = new Date();
  let dateCreated= `${current_date.getDate()}/${current_date.getMonth() + 1}/${current_date.getFullYear()}`;

  if (inputProject === '') {
    alert("Escreva o nome de um projeto!");
  } else {
    insertList(0, inputProject, inputDescription, dateCreated);
    postItem(inputProject, inputDescription);
    alert("Projeto adicionado!");
  }
}

/*
  --------------------------------------------------------------------------------------
  Função para colocar um item na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
const postItem = async (inputProject, inputDescription) => {
  const formData = new FormData();
  formData.append('name', inputProject);
  formData.append('description', inputDescription);

  let url = 'http://127.0.0.1:5000/project';
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  --------------------------------------------------------------------------------------
  Função para deletar um item da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteItem = (item) => {
  console.log(item)
  let url = 'http://127.0.0.1:5000/delete/project?name=' + item;
  fetch(url, {
    method: 'delete'
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}
/*
  --------------------------------------------------------------------------------------
  Functions related to tasks content
  --------------------------------------------------------------------------------------
*/
// Função para esperar o elemento. Não há necessidade de um timeout mas
// continuamos tentando realizar as tarefas dentro da especificação, sem
// requerer a bibliotecas e frameworks. Também seria possível o uso de rotas
// totalmente desenhadas em JS mas seria necessário reprojetar o
// front-end.
function waitForElement(selector, timeout = 500000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function checkElement() {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Timeout waiting for element with selector "${selector}"`));
      } else {
        setTimeout(checkElement, 100);
      }
    }

    checkElement();
  });
}
/*
  --------------------------------------------------------------------------------------
  Função que espera para carregamento do elemento Tasks-link
  --------------------------------------------------------------------------------------
*/
// Espera existir algum link com tarefas
waitForElement('#tasks-link')
  .then((element) => {
    // pega o valor passado como parâmetro ao clicar
    var tasksLink = document.getElementById('tasks-link');
    // cria o método para aguardar o clique
    tasksLink.addEventListener('click', function (event) {
    let project_id = event.currentTarget.param;
    current_project = project_id
      // Prevent the default behavior of the link
      event.preventDefault();

      // Fetch content from projects.html
      fetch('/task.html')
          .then(response => response.text())
          .then(data => {
              // Update the content with the fetched data
              contentDiv.innerHTML = data;
              //Populates table
              getTask(current_project);
              // Attach the function to the click event of the <a> element
              document.getElementById('nova_tarefa_clique').addEventListener('click', toggleVisibility);
          })
          .catch(error => {
              console.error('Não foi possível carregar', error);
          });
      });
  })
  .catch((error) => {
    console.error(error.message);
  });

/*
  --------------------------------------------------------------------------------------
  Contrói a lista de tarefas. Mais uma vez poderia ser utilizado DRY mas o
  tempo curto não permite. Uma modificação mais abstrata permitiria passar
  a url e os dados.
  --------------------------------------------------------------------------------------
*/

const getTask = async (project_id) => {
  let url = 'http://127.0.0.1:5000/project_task?project_id=' + project_id;
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.tasks.forEach(item => insertTask(item.id, item.name, item.description, item.date_created))
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
/*
  --------------------------------------------------------------------------------------
  insere a tarefa na tabela
  --------------------------------------------------------------------------------------
*/
const insertTask = (taskID, nameTask, description, date_added) => {
  let item = [nameTask, description, date_added]
  let table = document.getElementById('tbl_tasks');
  let row = table.insertRow();

  for (let i = 0; i < item.length; i++) {

    let cel = row.insertCell(i);

    // Aqui os nomes de projeto viram links
    if (i === 0){
      var link = document.createElement('a');
      link.param = encodeURIComponent(taskID); // Ensure proper URL encoding
      link.id = encodeURIComponent('task-link')
      link.textContent = nameTask;
      cel.appendChild(link);
    } else {
      // For other cells, set text content directly
      cel.textContent = item[i];
    }
  }

  insertButton(row.insertCell(-1))
  document.getElementById("newTask").value = "";
  document.getElementById("newDescription").value = "";

  removeElement()
}

/*
  --------------------------------------------------------------------------------------
  Função para adicionar um novo projeto com descrição
  --------------------------------------------------------------------------------------
*/
const newTaskItem = () => {
  let inputTask = document.getElementById("newTask").value;
  let inputDescription = document.getElementById("newDescription").value;
  // Pega a date de hoje
  let current_date = new Date();
  let dateCreated= `${current_date.getDate()}/${current_date.getMonth() + 1}/${current_date.getFullYear()}`;
  // continua
  let inputHeader = document.getElementById("newHeader").value;
  let inputFooter = document.getElementById("newFooter").value;
  let inputLineOverlap = document.getElementById("newLineOverlap").value;
  let inputLineMargin = document.getElementById("newLineMargin").value;
  let inputCharMargin = document.getElementById("newCharMargin").value;
  let inputPageRange = document.getElementById("newPageRange").value;
  let inputFile = document.getElementById("newFile").value;

  console.log(current_project)
  if (inputTask === '') {
    alert("Dê um nome para a tarefa!");
  } else {
    insertTask("", inputTask, inputDescription, dateCreated);
    postTask(inputTask, inputDescription, inputHeader, inputFooter, inputLineOverlap, inputLineMargin, inputCharMargin, inputPageRange);
    alert("Tarefa adicionada!");
  }
}
/*
  --------------------------------------------------------------------------------------
  Função para colocar uma tarefa na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/
  const postTask = async (inputTask, inputDescription, inputHeader, inputFooter, inputLineOverlap, inputLineMargin, inputCharMargin, inputPageRange) => {
  const formData = new FormData();
  formData.append('name', inputTask);
  formData.append('description', inputDescription);
  formData.append('header', inputHeader);
  formData.append('footer', inputFooter);
  formData.append('line_overlap', inputLineOverlap);
  formData.append('line_margin', inputLineMargin);
  formData.append('char_margin', inputCharMargin);
  formData.append('page_numbers', inputPageRange);
  formData.append('project_id', "1");


  let url = 'http://127.0.0.1:5000/task';

  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error:', error);
    });
}