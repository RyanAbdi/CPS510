// Function to fetch records from the database
async function myFunction() {
    var params = new URLSearchParams(window.location.search);
    var tableName = params.get('table');
    console.log(tableName);

    const response = await fetch(`http://localhost:4000/select-table?table=${tableName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function () {
    const records = await myFunction();
    const recordsContainer = document.getElementById('records-container');

    var params = new URLSearchParams(window.location.search);
    var tableName = params.get('table');

    if (!tableName) {
        console.error('No table name specified in URL parameters.');
        return;
    }

    const tableNameElement = document.getElementById('table-name');
    tableNameElement.textContent = tableName; // Set the table name as text

    const table = document.createElement('table');
    table.classList.add('styled-table');
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    if (records.length > 0) {
        Object.keys(records[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });

        const editDeleteHeader = document.createElement('th');
        editDeleteHeader.textContent = 'Actions';
        headerRow.appendChild(editDeleteHeader);
        thead.appendChild(headerRow);
    }
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');


    let firstObject = records[0]; 
    let keys = Object.keys(firstObject);
    let primaryKeyColumn = keys[0];
    console.log(primaryKeyColumn);

    records.forEach(record => {
        const row = document.createElement('tr');
        let recordId; // Variable to store the ID of the record


        Object.entries(record).forEach(([key, value]) => {
            if (key.toUpperCase() === primaryKeyColumn) { // Make sure this matches the key from your data
                recordId = value;
            }
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });

        console.log(recordId);
        // Create edit and delete buttons
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', function editClickHandler() {
            row.querySelectorAll('td:not(:last-child)').forEach((cell, cellIndex) => {
                cell.setAttribute('contenteditable', true);
            });

            const firstCell = row.firstElementChild;
            firstCell.focus();
            const range = document.createRange();
            range.selectNodeContents(firstCell);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            editButton.textContent = 'Save';
            editButton.removeEventListener('click', editClickHandler);
            editButton.addEventListener('click', function saveClickHandler() {
                row.querySelectorAll('td').forEach((cell, cellIndex) => {
                    cell.setAttribute('contenteditable', false);
                });

                editButton.textContent = 'Edit';
                editButton.removeEventListener('click', saveClickHandler);
                editButton.addEventListener('click', editClickHandler);
            });
        });


        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => handleDelete(recordId, primaryKeyColumn, row));

        // Add buttons to the row
        const actionCell = document.createElement('td');
        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    recordsContainer.appendChild(table);
});

// Function to handle the deletion of a record
async function handleDelete(recordId, primaryKeyColumn, row) {
    var params = new URLSearchParams(window.location.search);
    var tableName = params.get('table');

    try {
        const encodedTableName = encodeURIComponent(tableName);
        const encodedPrimaryKeyColumn = encodeURIComponent(primaryKeyColumn);
        const encodedRecordId = encodeURIComponent(recordId);
        const response = await fetch(`http://localhost:4000/delete-record/${encodedTableName}/${encodedPrimaryKeyColumn}/${encodedRecordId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log('Record deleted successfully');
            row.remove(); 
        } else {
            if (response.status === 500) {
                const errorData = await response.json();
                if (errorData.code === 'ORA-02292') {
                    alert('Cannot delete this record because it is referenced by other records.');
                } else {
                    alert('Failed to delete record. Error: ' + errorData.message);
                }
            } else {
                alert('Failed to delete record. HTTP status: ' + response.status);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while trying to delete the record.');
    }
}

