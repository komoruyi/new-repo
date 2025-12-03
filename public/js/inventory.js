'use strict'

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList")

if (classificationList) {
  classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value
    console.log(`classification_id is: ${classification_id}`)
    let classIdURL = "/inv/getInventory/" + classification_id
    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        throw Error("Network response was not OK");
      })
      .then(function (data) {
        console.log(data);
        buildInventoryList(data);
      })
      .catch(function (error) {
        console.log('There was a problem: ', error.message)
      })
  })
}

// buildInventoryList should exist elsewhere (or be added below) to transform returned JSON into table rows
// Example minimal implementation (uncomment and adapt if you need a quick starter):
/*
function buildInventoryList(data) {
  const table = document.getElementById("inventoryDisplay");
  if (!table) return;

  if (!Array.isArray(data) || data.length === 0) {
    table.innerHTML = "<tr><td>No inventory found for this classification.</td></tr>";
    return;
  }

  let html = `
    <thead>
      <tr>
        <th>Image</th>
        <th>Year</th>
        <th>Make & Model</th>
        <th>Price</th>
        <th>Miles</th>
        <th>Color</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
  `;

  data.forEach((item) => {
    const image = item.inv_image || "/images/no-image.png";
    const price = item.inv_price ? `$${parseFloat(item.inv_price).toLocaleString()}` : "";
    const detailsLink = `/inv/detail/${item.inv_id}`;

    html += `
      <tr>
        <td><img src="${image}" alt="${item.inv_make} ${item.inv_model}" style="max-width:120px;"></td>
        <td>${item.inv_year || ""}</td>
        <td>${item.inv_make || ""} ${item.inv_model || ""}</td>
        <td>${price}</td>
        <td>${item.inv_miles || ""}</td>
        <td>${item.inv_color || ""}</td>
        <td><a href="${detailsLink}">View</a></td>
      </tr>
    `;
  });

  html += "</tbody>";
  table.innerHTML = html;
}
*/

// Build inventory items into HTML table components and inject into DOM 
function buildInventoryList(data) { 
    let inventoryDisplay = document.getElementById("inventoryDisplay"); 
    // Set up the table labels 
    let dataTable = '<thead>'; 
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; 
    dataTable += '</thead>'; 
    // Set up the table body 
    dataTable += '<tbody>'; 
    // Iterate over all vehicles in the array and put each in a row 
    data.forEach(function (element) { 
     console.log(element.inv_id + ", " + element.inv_model); 
     dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`; 
     dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
     dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; 
    }) 
    dataTable += '</tbody>'; 
    // Display the contents in the Inventory Management view 
    inventoryDisplay.innerHTML = dataTable; 
   }