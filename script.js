/*
  This is your site JavaScript code - you can add interactivity!
*/

// Print a message in the browser's dev tools console each time the page loads
// Use your menus or right-click / control-click and choose "Inspect" > "Console"
console.log("Hello 🌎");

let stopRecursing = {};

const customerData = [
  { ssn: "444-44-4444", name: "Bill", age: 35, email: "bill@company.com" },
  { ssn: "555-55-5555", name: "Donna", age: 32, email: "donna@home.org" },
];

var createWriteAndRead = function(dbName) {
  const request = indexedDB.open(dbName, 2);

  request.onerror = (event) => {
    // Handle errors.
  };
  request.onsuccess = (event) => {
    const db = event.target.result;
    if (db.name == 'db1') {
      writeSomeOtherData(db);
    }
    writeCustomerData(db);
    read444(db);
  }
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("providers", { keyPath: "ssn" });
    // Create an objectStore to hold information about our customers. We're
    // going to use "ssn" as our key path because it's guaranteed to be
    // unique - or at least that's what I was told during the kickoff meeting.
    const objectStore = db.createObjectStore("customers", { keyPath: "ssn" });

    // Create an index to search customers by name. We may have duplicates
    // so we can't use a unique index.
    objectStore.createIndex("name", "name", { unique: false });

    // Create an index to search customers by email. We want to ensure that
    // no two customers have the same email, so use a unique index.
    objectStore.createIndex("email", "email", { unique: true });
  }
}

// Writes data to "providers" object store.
var writeSomeOtherData = function(db) {
  const txn = db.transaction("providers", "readwrite");
  const providerObjectStore = txn.objectStore("providers");
  customerData.forEach((customer) => {
    providerObjectStore.add(customer);
  });
  var recurse = function(event) {
    if (!stopRecursing[db.name]) {
      var innerRequest = providerObjectStore.get("555-55-5555");
      innerRequest.onsuccess = recurse;
    }
  };
  var request = providerObjectStore.get("555-55-5555");
  request.onsuccess = recurse;
}

// Writes data to "customers" object store.
var writeCustomerData = function(db) {
  const customerObjectStore = db
    .transaction("customers", "readwrite")
    .objectStore("customers");
  customerData.forEach((customer) => {
    customerObjectStore.add(customer);
  });
}

// Reads data from "providers" object store.
var read444 = function(db) {
  const transaction = db.transaction(["customers"]);
  const objectStore = transaction.objectStore("customers");
  const request = objectStore.get("444-44-4444");
  request.onerror = (event) => {
    // Handle errors!
  };
  request.onsuccess = (event) => {
    // Do something with the request.result!
    console.log(`Name for SSN 444-44-4444 is ${request.result.name}`);
    stopRecursing[db.name] = true;
    document.getElementById('result-' + db.name).innerText = "success";
  };
}

createWriteAndRead("db1");
createWriteAndRead("db2");