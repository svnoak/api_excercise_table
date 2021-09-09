
const table = {
   add: function(){
      fetch(new Request('http://mpp.erikpineiro.se/dbp/users/',
         {
            method: 'POST',
            body: JSON.stringify(table.getPerson(event.target)),
            headers: {"Content-type": "application/json; charset=UTF-8"},
         }))
         .then( response => {
            if (response.status === 409) {
               console.log("Person already in DB");
               throw Error("Person already in DB");
            } else {
               return response.json();
            }
         })
         .then(console.log)
         .then(grid.forceRender())
         .then(table.renderStatus())
         .catch(console.log);  
   },
   patch: function(data){
      let input = data.target.parentElement.parentElement.parentElement.querySelectorAll("input");
      let obj = {
         id: input[3].value,
         firstName: input[0].value,
         lastName: input[1].value,
         born: input[2].value
      };
      fetch(new Request('http://mpp.erikpineiro.se/dbp/users/',
      {
         method: 'PATCH',
         body: JSON.stringify(obj),
         headers: {"Content-type": "application/json; charset=UTF-8"},
      }))
      .then( response => {
         response.json();
      })
      .then(table.closeModal())
      .then(table.updateTable().forceRender())
      .then(table.renderStatus())
      .catch(console.log);
   },
   remove: function(data){
      let id = data.target.parentElement.parentElement.querySelector("#ID_edit input").value;
      fetch(new Request('http://mpp.erikpineiro.se/dbp/users/',
         {
            method: 'DELETE',
            body: JSON.stringify({id: id}),
            headers: {"Content-type": "application/json; charset=UTF-8"},
         }))
         .then( response => {
            if (response.status === 404) {
               console.log("No person with that id in DB");
               throw Error("Person already in DB");
            } else {
               return response.json();
            }
         })
         .then(table.closeModal())
         .then(table.updateTable().forceRender())
         .then(table.renderStatus())
         .catch(console.log);
   },
   initialize: function(){
      let headers = [
         "Firstname", 
         "Lastname", 
         "Born", 
         "ID",
         {
            name: 'Actions',
            formatter: (cell, row) => {
               return gridjs.h('button', {
                 className: 'py-2 mb-4 px-4 border rounded-md text-white bg-blue-600',
                 onClick: () => table.showModal(headers, row)
               }, 'Edit');
             }
         }
      ];
      let grid = new gridjs.Grid({
         columns: headers,
         server: {
            url: 'http://mpp.erikpineiro.se/dbp/users/',
            then: data => {
               let mappedData = data.map( card => {
                  if( card != null ){
                     return [card.firstName, card.lastName, card.born, card.id]
                  }
               
               } );
               let sanitizedData = mappedData.filter( data => data != undefined );
               return sanitizedData;
            },
            catch: error => console.log(error),
            handle: (res) => {
              // no matching records found
              if (res.status === 404) return {data: []};
              if (res.ok) return res.json();
              
              throw Error('oh no :(');
            },
          }, 
         sort: true,
         search: {
            enabled: true
          },
          pagination: {
            enabled: true,
            limit: 10,
            summary: false,
          }
       })
       return grid;
   },
   renderTable: function(){
      return this.initialize().render(document.getElementById("table"));
   },
   updateTable: function(){
      let update = grid.updateConfig({
         pagination:{
            page: table.getCurrentPage()
         }
      });
      return update;
   },
   showModal: function(headers, data){
      document.body.classList.add("noscroll");
      document.body.append(table.modal.create(headers,data));
   },
   closeModal: function(){
      document.querySelector("#overlay").remove();
      document.body.classList.remove("noscroll");
   },
   modal: {
      create: function(columns, data){
      if(typeof(columns) != "array") columns=[
         "Firstname", 
         "Lastname", 
         "Born", 
         "ID",
      "Action"]
      let overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.id = "overlay";
      let modal = document.createElement("div");
      modal.id="modal_edit";
      modal.className = "modal";

      let header = document.createElement("div");
      header.className = "modal_header";

      let footer = document.createElement("div");
      footer.className = "modal_footer";
      let rightFooter = document.createElement("div");

      let closeBtn = document.createElement("div");
      closeBtn.id = "close";
      closeBtn.textContent = "X";
      closeBtn.addEventListener("click", table.closeModal);

      let updateBtn = document.createElement("button");
      updateBtn.id = "patch";
      updateBtn.textContent = "Save";
      updateBtn.addEventListener("click", data ? table.patch : table.add);

      let cancelBtn = document.createElement("button");
      cancelBtn.id = "cancel";
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", table.closeModal);

      let deleteBtn = document.createElement("button");
      deleteBtn.id = "remove";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", table.remove.bind(data));

      header.append(closeBtn);

      rightFooter.append(cancelBtn, updateBtn);
      footer.append(deleteBtn, rightFooter );

      modal.append(header);

      columns.slice(0,-1).forEach( (header, index) => {
         let div = document.createElement("div");
         div.id = `${header}_edit`;
         div.className = "input";

         let label = document.createElement("label");
         label.textContent = header;

         let input = document.createElement("input");
         input.value = data != null ? data.cells[index].data : "";
         if(header == "ID") input.disabled = true;

         div.append(label,input);
         modal.append(div);
      } );

      modal.append(footer);
      overlay.append(modal);
      return overlay;
      },
   },
   renderStatus: function(){
      const statusCheck = setInterval( () => {
        let status = document.querySelector(".gridjs");
        if (status != null) table.addAddBtn();
        if (status != null) clearInterval(statusCheck);
      }, 100 );
      
   },
   addAddBtn: function(){
      let header = document.querySelector(".gridjs-head");
      let btn = document.createElement("button");
      btn.id = "add";
      btn.textContent = "Add";
      btn.addEventListener("click", table.showModal);

      header.append(btn);
   },
   getCurrentPage: function(){
      let currentPage = document.querySelector(".gridjs-currentPage").innerText;
      return parseInt(currentPage)-1;
   },
   getPerson: function(even){
      let input = event.target.parentElement.parentElement.parentElement.querySelectorAll(".input");
      let firstName = input[0].children[1].value;
      let lastName = input[1].children[1].value;
      let born = input[2].children[1].value;
      let person = {
         firstName,
         lastName,
         born
      }
      return person;
   }
}
const grid = table.renderTable();

table.renderStatus();

function getObjects(){
   let object;
   fetch("http://mpp.erikpineiro.se/dbp/users/")
   .then(res => res.json())
   .then(data => object = data)
   .then(() => object);
};

function deleteObject(object){
   fetch("http://mpp.erikpineiro.se/dbp/users/")
   .then(res => res.json())
   .then(data => resolveDataHandler(data, object));

   function resolveDataHandler(data, object){
      if(!object.id){
      let objName = object.firstName + object.lastName;
      data.forEach( d => {
         if(d != null){
            let dataName = d.firstName + d.lastName;
            console.log(dataName);
            if(dataName == objName) object.id = d.id;
         }
      })
      }
      fetch(new Request('http://mpp.erikpineiro.se/dbp/users/',
      {
         method: 'DELETE',
         body: JSON.stringify({id: object.id}),
         headers: {"Content-type": "application/json; charset=UTF-8"},
      }))
      .then( response => {
         if (response.status === 404) {
            console.log("No person with that id in DB");
            throw Error("Person already in DB");
         } else {
            return response.json();
         }
      })
   }
};